var Router = require('express').Router();
var controllers = require('../controllers');
const authMiddleware = require('../middlewares/auth/auth.middleware').authentication;

const routes = [

    //Amenity
    Router.post("/amenity/create", authMiddleware, controllers.amenity.CreateAmenity),
    Router.post("/amenity/list", authMiddleware, controllers.amenity.ListAmenity),
    Router.post("/amenity/update", authMiddleware, controllers.amenity.UpdateAmenity),

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

    //Community
    Router.post("/community/add", authMiddleware, controllers.community.AddCommunity),
    Router.post("/community/list", authMiddleware, controllers.community.ListCommunity),
    Router.post("/community/update", authMiddleware, controllers.community.UpdateCommunity),
    Router.post("/community/remove", authMiddleware, controllers.community.removeCommunity),
    Router.post("/community/details", authMiddleware, controllers.community.CommunityDetails),
    Router.post("/community/reaction/add", authMiddleware, controllers.community.addCommunityReaction),
    Router.post("/community/reaction/remove", authMiddleware, controllers.community.removeCommunityReaction),

    //Community Comment
    Router.post("/community/comment/list", authMiddleware, controllers.community_comment.getCommunityComments),
    Router.post("/community/comment/add", authMiddleware, controllers.community_comment.addCommunityComment),
    Router.post("/community/comment/remove", authMiddleware, controllers.community_comment.removeCommunityComment),
    Router.post("/community/comment/reaction/add", authMiddleware, controllers.community_comment.addCommunityCommentReaction),
    Router.post("/community/comment/reaction/remove", authMiddleware, controllers.community_comment.removeCommunityCommentReaction),


    //Fitness Live
    Router.post("/fitnesslive/add", authMiddleware, controllers.fitness_live.AddFitnesslive),
    Router.post("/fitnesslive/list", authMiddleware, controllers.fitness_live.ListFitnesslive),
    Router.post("/fitnesslive/remove", authMiddleware, controllers.fitness_live.removeFitnesslive),
    Router.post("/fitnesslive/update", authMiddleware, controllers.fitness_live.UpdateFitnesslive),
    Router.post("/fitnesslive/details", authMiddleware, controllers.fitness_live.FitnessliveDetails),
    Router.post("/fitnesslive/reaction/add", authMiddleware, controllers.fitness_live.addFitnessliveReaction),
    Router.post("/fitnesslive/reaction/remove", authMiddleware, controllers.fitness_live.removeFitnessliveReaction),

    //Fitness Live Comment
    Router.post("/fitnesslive/comment/list", authMiddleware, controllers.fitness_live_comment.getFitnessliveComments),
    Router.post("/fitnesslive/comment/add", authMiddleware, controllers.fitness_live_comment.AddFitnessliveComment),
    Router.post("/fitnesslive/comment/remove", authMiddleware, controllers.fitness_live_comment.removeFitnessliveComment),
    Router.post("/fitnesslive/comment/reaction/add", authMiddleware, controllers.fitness_live_comment.addFitnessliveCommentReaction),
    Router.post("/fitnesslive/comment/reaction/remove", authMiddleware, controllers.fitness_live_comment.removeFitnessliveCommentReaction),

    //Gym
    Router.post("/gym/create", authMiddleware, controllers.gym.CreateGym),
    Router.post("/gym/details", authMiddleware, controllers.gym.GymDetails),
    Router.get("/gym/facilities", authMiddleware, controllers.gym.getFacilities),
    Router.post("/gym/list", authMiddleware, controllers.gym.ListGym),
    Router.post("/gym/update", authMiddleware, controllers.gym.UpdateGym),

    //Machine
    Router.post("/machine/create", authMiddleware, controllers.machine.CreateMachine),
    Router.post("/machine/list", authMiddleware, controllers.machine.ListMachine),
    Router.post("/machine/update", authMiddleware, controllers.machine.UpdateMachine),

    //Pushnotification
    Router.post("/pushnotification/sendpushnotification", authMiddleware, controllers.userdeviceinfo.sendpushnotification),

    //Rating
    Router.post("/rating/add", authMiddleware, controllers.rating.addRating),
    Router.post("/rating/list", authMiddleware, controllers.rating.ListRating),

    //Restaurant
    Router.post("/restaurant/create", authMiddleware, controllers.restaurant.CreateRestaurant),
    Router.post("/restaurant/update", authMiddleware, controllers.restaurant.UpdateRestaurant),
    Router.post("/restaurant/availability", authMiddleware, controllers.restaurant.UpdateRestaurantAvailability),
    Router.post("/restaurant/list", authMiddleware, controllers.restaurant.ListRestaurant),
    Router.post("/restaurant/details", authMiddleware, controllers.restaurant.RestaurantDetails),

    //Restaurant Item
    Router.post("/restaurantitem/create", authMiddleware, controllers.restaurantitem.CreateRestaurantItem),
    Router.post("/restaurantitem/update", authMiddleware, controllers.restaurantitem.UpdateRestaurantItem),
    Router.post("/restaurantitem/details", authMiddleware, controllers.restaurantitem.RestaurantItemDetails),
    Router.post("/restaurantitem/list", authMiddleware, controllers.restaurantitem.ListRestaurantItem),
    Router.post("/restaurantitem/availability", authMiddleware, controllers.restaurantitem.UpdateRestaurantItemAvailability),

    //Role
    Router.post("/role/create", authMiddleware, controllers.role.CreateRole),
    Router.get("/role/list", authMiddleware, controllers.role.ListRole),

    //Service
    Router.post("/service/create", authMiddleware, controllers.service.CreateService),
    Router.post("/service/list", authMiddleware, controllers.service.ListService),
    Router.post("/service/update", authMiddleware, controllers.service.UpdateService),

    //Tag
    Router.post("/tag/add", authMiddleware, controllers.tag.CreateTag),
    Router.get("/tag/list", authMiddleware, controllers.tag.ListTags),

    //User
    Router.post("/users/adddeviceinfo", authMiddleware, controllers.userdeviceinfo.addDeviceInfo),
    Router.post("/users/byid", authMiddleware, controllers.user.ListAllUser),
    Router.post("/user/friend/add", authMiddleware, controllers.userfriend.addFriendRequest),
    Router.post("/user/friend/list", authMiddleware, controllers.userfriend.listUserFriend),
    Router.post("/user/friend/remove", authMiddleware, controllers.userfriend.removeUserFriend),
    Router.post("/user/friend/accept", authMiddleware, controllers.userfriend.acceptFriendRequest),
    Router.post("/user/list", authMiddleware, controllers.user.ListUser),
    Router.get("/user/logout", authMiddleware, controllers.user.UserLogout),
    Router.post("/user/update", authMiddleware, controllers.user.UpdateUser),
    Router.post("/file/upload", authMiddleware, controllers.user.UploadFiles), // (File Upload )

    //Rate
    Router.post("/rate/add", authMiddleware, controllers.rate.AddRate),
    Router.post("/rate/star/add", authMiddleware, controllers.rate.addRateStar),
    Router.post("/rate/star/update", authMiddleware, controllers.rate.updateRateStar),
    Router.post("/rate/list", authMiddleware, controllers.rate.ListRate),

    //Rate Comment
    Router.post("/rate/comment/list", authMiddleware, controllers.rate_comment.getRateComments),
    Router.post("/rate/comment/add", authMiddleware, controllers.rate_comment.addRateComment),
    Router.post("/rate/comment/remove", authMiddleware, controllers.rate_comment.removeRateComment),
    Router.post("/rate/comment/reaction/add", authMiddleware, controllers.rate_comment.addRateCommentReaction),
    Router.post("/rate/comment/reaction/remove", authMiddleware, controllers.rate_comment.removeRateCommentReaction),
];
module.exports = routes;