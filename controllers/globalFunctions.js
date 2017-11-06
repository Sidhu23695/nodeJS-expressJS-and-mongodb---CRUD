const _ = require('lodash');


// export global functions

module.exports = {
    requiredFields: (inputFields, validFields) => {
        let noMissingFields = validFields.reduce((result, x) => {
            return result && (x in inputFields);
        }, true)
        return noMissingFields;
    }
}