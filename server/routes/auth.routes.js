var Router = require('express').Router();
var controllers = require('../controllers');
const authMiddleware = require('../middlewares/auth/auth.middleware').authentication;

const routes = [

    
    /* Chatting */
    Router.post("/chat-room", authMiddleware, controllers.chatrooms.getDetail),
    Router.post("/chat-rooms", authMiddleware, controllers.chatrooms.getRooms),
    Router.post("/check-room", authMiddleware, controllers.chatrooms.getRoomDetail),
    Router.get("/chat-room/count", authMiddleware, controllers.chatrooms.getUserCount),
    Router.post("/chat/messages", authMiddleware, controllers.chatmessages.getMessages),
    Router.post("/chat/send/message", authMiddleware, controllers.chatmessages.sendMessage),
    Router.post("/chat/message/readmsg", authMiddleware, controllers.chatmessages.readMessage),
    Router.post("/chat-room/create", authMiddleware, controllers.chatrooms.createRoom),
    Router.post("/chat-room/update", authMiddleware, controllers.chatrooms.updateRoom),
    Router.post("/chat-room/user/add", authMiddleware, controllers.chatrooms.addUser),
    Router.post("/chat-room/user/remove", authMiddleware, controllers.chatrooms.removeUser),

    
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