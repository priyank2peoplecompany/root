const v = require('validator');

/** 
 * This Function will validate the "fields" against the "validators" in 2 parts
 * 1. it will check for any missing fields
 * 2. if all fields are avaulables then check for the data types
 * 
 * res : to send the response if any error found
 * validators : rules to check the validation
 * fields : fields that we get from the client side
 */
exports.validate = ( res , validators , fields ) => {

    var returnRes = { 'status' : false , message : '' , 'data' : [] };
    var missingFields = [];
    var failedFields = [];

    //------------- Start : Missing fields validations ---------------- //
    for(key in validators)
    {
        if(!fields[key] && fields[key] != 0  && validators[key].indexOf('optional') == -1 )
        {
            missingFields.push(key)
        }
    }

    if(missingFields.length > 0) {
        returnRes.status = false;
        returnRes.data = missingFields;
        returnRes.message = "Missing Fields : Please send proper fields";
        cres.vfaild(res , returnRes);
        return false;
    }
    //------------- End : Missing fields validations ---------------- //
    //------------- Start : Data type validations -------------- //
    else {
        for(key in validators)
        {
            var validations = validators[key].split("|");

            // check if the field is optional or not
            if(validations.indexOf('optional') > -1)
            {
                // check if optional filed is available or not 
                // if not then move to next field
                if(fields[key] == undefined)
                    continue;                
            }

            // check if param is object , if not convert to string
            var value = returnValue(fields[key]);
            var errors = [];
            
            if( validations.indexOf('allow_empty') == -1 && !Array.isArray(value) && v.isEmpty(value))
            {
                errors.push('Field is empty');
            }
            if(validations.indexOf('integer') > -1)
            {
                v.isInt(value) ? '' : errors.push('Field is not ineteger') ;
            }

            if(validations.indexOf('email') > -1)
            {                
                v.isEmail(value) ? '' : errors.push('Provide proper mail id') ;
            }

            if(validations.indexOf('float') > -1)
            {
                v.isFloat(value) ? '' : errors.push('Field is not float') ;
            }
            if(validations.indexOf('date') > -1)
            {
                v.toDate(value) ? '' : errors.push('Field is not valid date') ;
            }
            if(validations.indexOf('json') > -1)
            {
                v.isJSON(value) ? '' : errors.push('Field is not Json') ;
            }
            if(validations.indexOf('array') > -1)
            {
                Array.isArray(fields[key]) ? '' : errors.push('Field is not Array') ;
            }

            if(validations.indexOf('any') > -1)
            {
                continue;                
            }

            if(errors.length > 0)
            {
                failedFields.push({'field' : key , errors});
            }
        }

        if(failedFields.length > 0)
        {
            returnRes.status = "false";
            returnRes.data = failedFields;
            returnRes.message = "Wrong Data Fields : Please send proper data";
            cres.vfaild(res , returnRes);
            return false;
        }
    }
    //------------- Start : Data type validations -------------- //
    
    // Returns true if everything is good
    return true;
}

function returnValue(value){
    if(Array.isArray(value)) {
        return value;
    } else if(typeof value == 'object') {
        return JSON.stringify(value);
    } else {
        return value.toString();
    }
}