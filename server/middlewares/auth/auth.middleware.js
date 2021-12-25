
const redis = require('../../helpers/redis.helper');
const cres = require('../../helpers/response.helper');
const permissions = require('./permissions');
const CryptoJS = require("crypto-js");
require('dotenv-expand')(require('dotenv').config());

// check for if user is logged in or not
const isAuthentication = true;

// check for if user is authorized for the api call or not
const isAuthorization = false;

var key = CryptoJS.enc.Base64.parse(`${process.env.SECRET_KEY}`);
var iv = CryptoJS.enc.Base64.parse(`${process.env.SECRET_IV}`);
var option = { mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7, iv: iv };


exports.openAuthentication = (req, res, next) => {

    if (req.body.data) {
        req.body = JSON.parse(CryptoJS.AES.decrypt(req.body.data, key, option).toString(CryptoJS.enc.Utf8));
    }
    next();
}

/**
 * Authentication is the process of verifying who you are. 
 * When you log on to a PC with a user name and password you are authenticating.
 */
exports.authentication = (req, res, next) => {


    if (req.body.data) {
        req.body = JSON.parse(CryptoJS.AES.decrypt(req.body.data, key, option).toString(CryptoJS.enc.Utf8));
    }

    // This will not check the user's logged in token if `isAuthentication` is set to false
    if (!isAuthentication) {
        next();
    }
    else if (req.headers['authorization']) {
        let key = req.headers['authorization'];

        // This will check if there is any data with given key in Redis server
        redis.getKey(key).then(data => {
            if (data) {
                req.user = data;
                next();
            }
            else
                cres.statusError(res, 401, 'Please login again');
        });
    }
    else
        cres.statusError(res, 401, 'Please login again');
}

/**
 * Authorization : is the process of verifying that you have access to something. 
 * Gaining access to a resource (e.g. directory on a hard disk) because the 
 * permissions configured on it allow you access is authorization.
 */
exports.authorization = (req, res, next) => {

    // This will bypass all the authorization if `isAuthorization` is set to false
    if (!isAuthorization) {
        next();
    }
    else if (req.user) {
        var api_path = req.route.path;
        for (let param in req.params) {
            type = isNaN(req.params[param]) ? 'string' : 'number';
            api_path = api_path.replace(param, type);
        }

        var found = permissions[req.user.user_type].every(data => {
            if (data.method == req.method && data.api == api_path && data.allowed) {
                return true;
            }
        });

        if (found)
            next();
        else
            cres.statusError(res, 403, "You are not athorized to call this api");
    }
    else {
        cres.statusError(res, 401, 'Please login again');
    }
}