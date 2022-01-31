
var Router = require('express').Router();
var controllers = require('../controllers');
const openAuthentication = require('../middlewares/auth/auth.middleware').openAuthentication;

const routes = [
    
    /** Common */
    Router.post("/html/upload", openAuthentication, controllers.common.UploadHTMLFiles), // (File Upload ),
    
    /**  User */
    Router.post("/user/sendotp", openAuthentication, controllers.user.SendOTP),
    Router.post("/user/validateotp", openAuthentication, controllers.user.ValidateOTP),
];

module.exports = routes;