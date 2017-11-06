const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    uniqueValidator = require('mongoose-unique-validator'),
    bcrypt = require('bcrypt-nodejs');

//create a schema 
const userSchema = new Schema({
    firstName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        select: false,
        required: [true, 'Password is required']
    }
}, {
    timestamps: true
});



//engaing mongoose unique validator to the schema

userSchema.plugin(uniqueValidator, {
    message: '{PATH} must be unique'
});


//method to encrypt password
userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//method to decrypt password
userSchema.methods.validPassword = function (password) {
    let user = this;
    return bcrypt.compareSync(password, user.password);
};



//create the model
const userDataModel = mongoose.model('User', userSchema);

//export the model
module.exports = userDataModel;