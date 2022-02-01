var Router = require('express').Router();
var controllers = require('../controllers');
const authMiddleware = require('../middlewares/auth/auth.middleware').authentication;

const routes = [

    /* Category */
    Router.post("/category/add", authMiddleware, controllers.category.addCategory),
    Router.post("/category/list", authMiddleware, controllers.category.ListCategory), 
    Router.post("/category/detail", authMiddleware, controllers.category.DetailedCategory), 
    
    /* Common */
    Router.post("/file/upload", authMiddleware, controllers.common.UploadFiles), // (File Upload )
    

    /* Design */
    Router.post("/design/add", authMiddleware, controllers.design.addDesign),
    Router.post("/design/updateHtml", authMiddleware, controllers.design.getDesign),

    //Pushnotification
    //Router.post("/pushnotification/sendpushnotification", authMiddleware, controllers.userdeviceinfo.sendpushnotification),

    //User
    Router.post("/users/byid", authMiddleware, controllers.user.ListAllUser),
    Router.post("/user/list", authMiddleware, controllers.user.ListUser),
    Router.get("/user/logout", authMiddleware, controllers.user.UserLogout),
    Router.post("/user/update", authMiddleware, controllers.user.UpdateUser),
    

];
module.exports = routes;