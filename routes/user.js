//load dependencies

const _ = require('lodash'),
    express = require('express'),
    mongoose = require('mongoose'),
    moment = require('moment'),
    ObjectID = require('mongoose').Types.ObjectId,
    globalFunctions = require('../controllers/globalFunctions');
userRouter = express.Router();


//import schema models
const User = require('../models/user'),
    Info = require('../models/info'),
    Employment = require('../models/employementDetails');


// --------------Required API begins

// API to create user (inserting data into multiple schema models related to the user)

userRouter.post('/create', (req, res) => {
    let requiredInputs = ['firstName', 'lastName', 'email', 'password', 'officeName', 'designation', 'dateOfBirth', 'country', 'city'];
    let isValidInput = globalFunctions.requiredFields(req.body, requiredInputs);
    if (!isValidInput) {
        return res.status(400).json({
            error: 'Required fields missing'
        });
    }
    let formData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email
    }
    let user = new User(formData);
    user.password = user.generateHash(req.body.password);
    // save user details on user collection
    user.save().then((userBasic) => {
        let userData = userBasic;
        let infoData = {
            user: userData._id,
            officeName: req.body.officeName,
            designation: req.body.designation
        }
        let info = new Employment(infoData);
        // save user information in Info collection
        return info.save().then((userInfo) => {
            return [userData, userInfo];
        })
    }).then((result) => {
        let employeeData = {
            dateOfBirth: moment(req.body.dateOfBirth).format(),
            country: req.body.country,
            city: req.body.city,
            employmentDetails: result[1]._id
        };
        // save user's employement details
        let empData = new Info(employeeData);
        return empData.save().then((userEmp) => {
            result.push(userEmp);
            return result;
        });
    }).then((result) => {
        res.status(200).json({
            message: 'User saved successfully'
        });
    }).catch((err) => {
        if (err.name === "ValidationError") {
            return res.status(400).json({
                error: err.message
            });
        }
        return res.status(500).json({
            error: "Internal server error"
        });
    });
});


// API to update user employment information (updating data in Employment schema)

userRouter.put('/update/:id', (req, res) => {
    if (!ObjectID.isValid(req.params.id)) {
        return res.status(404).json({
            error: "Invalid information"
        });
    }
    Info.findOne({
        _id: req.params.id
    }).then((doc) => {
        if (doc === null) {
            return false
        }
        if (req.body.dateOfBirth) doc.dateOfBirth = req.body.dateOfBirth;
        if (req.body.city) doc.city = req.body.city;
        if (req.body.country) doc.country = req.body.country;
        return doc.save().then((updatedDoc) => {
            return true
        })
    }).then((result) => {
        if (!result) {
            return res.status(404).json({
                error: 'User information not found'
            })
        }
        return res.status(200).json({
            message: 'User information updated'
        });
    }).catch((err) => {
        res.status(500).json({
            error: 'Internal server error'
        });
    });
});


// fetch user information and employment information of the user using mongoose deep populate 

userRouter.get('/fetchInfo/:id', (req, res) => {
    if (!ObjectID.isValid(req.params.id)) {
        return res.status(404).json({
            error: "Invalid information"
        });
    }
    Info.findOne({
        _id: req.params.id
    }).select('-__v').populate({
        path: 'employmentDetails',
        select: 'user officeName designation',
        populate: [{
            path: 'user',
            select: 'firstName lastName email',
        }]
    }).then((doc) => {
        if (!doc) {
            return res.status(404).json({
                error: 'User information not found'
            });
        }
        res.status(201).json({
            data: doc
        })
    }).catch((err) => {
        res.status(500).json({
            error: 'Internal server error'
        });
    });
});

// using promise.all() to query from multiple collections

userRouter.get('/fetchData/:id', (req, res) => {
    if (!ObjectID.isValid(req.params.id)) {
        return res.status(404).json({
            error: "Invalid information"
        });
    }
    let user = User.findOne({
        _id: req.params.id
    }).select('-__v');
    let totalUsers = User.count({});

    //promise all required queries together

    Promise.all([user, totalUsers]).then((doc) => {
        // result is provided in the doc value from the promise fulfillment in an array
        res.status(201).json({
            data: {
                user: doc[0],
                totalUsers: doc[1]
            }
        });
    }).catch((err) => {
        res.status(500).json({
            error: 'Internal server error'
        });
    });
});

// delete all user information 

userRouter.delete('/deleteUser/:id', (req, res) => {
    if (!ObjectID.isValid(req.params.id)) {
        return res.status(404).json({
            error: "Invalid information"
        });
    }
    // find user from user collection and remove
    User.findOneAndRemove({
        _id: req.params.id
    }).then((user) => {
        if (user === null) {
            return false
        }
        // find user employment information from employment collection and remove
        return Employment.findOneAndRemove({
            user: req.params.id
        }).then((userEmp) => {
            return [user, userEmp]
        });
    }).then((result) => {
        if (result === false) {
            return res.status(404).json({
                error: 'User not found'
            });
        }
        // find user information from Info collection and remove    
        Info.findOneAndRemove({
            employmentDetails: result[1]._id
        }).then((userInfo) => {
            return res.status(200).json({
                message: 'User deleted successfully'
            });
        });
    }).catch((err) => {
        res.status(500).json({
            error: 'Internal server error'
        });
    });
});




module.exports = userRouter;