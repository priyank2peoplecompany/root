var Router = require('express').Router();
var controllers = require('../controllers');
const authMiddleware = require('../middlewares/auth/auth.middleware').authentication;

const routes = [

    /* Category */
    Router.post("/category/add", authMiddleware, controllers.category.addCategory),
    Router.post("/category/list", authMiddleware, controllers.category.ListCategory), 
    
    //Pushnotification
    //Router.post("/pushnotification/sendpushnotification", authMiddleware, controllers.userdeviceinfo.sendpushnotification),

    //User
    Router.post("/users/byid", authMiddleware, controllers.user.ListAllUser),
    Router.post("/user/list", authMiddleware, controllers.user.ListUser),
    Router.get("/user/logout", authMiddleware, controllers.user.UserLogout),
    Router.post("/user/update", authMiddleware, controllers.user.UpdateUser),
    Router.post("/file/upload", authMiddleware, controllers.user.UploadFiles), // (File Upload )

];
module.exports = routes;