
var Router = require('express').Router();
var controllers = require('../controllers');
const openAuthentication = require('../middlewares/auth/auth.middleware').openAuthentication;

const routes = [
    //User
    //Router.post("/user/login", openAuthentication, controllers.user.Userlogin),
    Router.post("/user/sendotp", openAuthentication, controllers.user.SendOTP),
    Router.post("/user/validateotp", openAuthentication, controllers.user.ValidateOTP),
];

module.exports = routes;