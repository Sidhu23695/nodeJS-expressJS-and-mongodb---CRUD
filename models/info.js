const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

//create a schema 
const infoSchema = new Schema({
    dateOfBirth: {
        type: Date
    },
    country: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        trim: true
    },
    employmentDetails: {
        type: Schema.Types.ObjectId,
        ref: 'Employment'
    }
}, {
    timestamps: true
});

//create the model
const infoDataModel = mongoose.model('Info', infoSchema);

//export the model
module.exports = infoDataModel;