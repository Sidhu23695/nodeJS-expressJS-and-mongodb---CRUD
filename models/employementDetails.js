const mongoose = require('mongoose'),
    Schema = mongoose.Schema;
//create a schema 
const employmentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    officeName: {
        type: String,
        trim: true
    },
    designation: {
        type: String,
        trim: true
    },
}, {
    timestamps: true
});

//create the model
const employmentDataModel = mongoose.model('Employment', employmentSchema);

//export the model
module.exports = employmentDataModel;