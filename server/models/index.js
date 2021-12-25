module.exports = {

    //Amenity
    Amenity: require('./amenity/amenity.model'),

    //Community
    Community: require('./community/community.model'),
    CommunityComment: require('./community/community_comment.model'),

    //Chat
    ChatMessage: require('./chatting/chat-message.model'),
    ChatRoom: require('./chatting/chat-room.model'),

    //Fitness Live
    Fitnesslive: require('./fitness_live/fitness_live.model'),
    FitnessliveComment: require('./fitness_live/fitness_live_comment.model'),

    //Gym
    Gym: require('./gym/gym.model'),

    //Machine
    Machine: require('./machine/machine.model'),

    //Pushnotification
    Pushnotification: require('./pushnotification/pushnotification.model'),

    //Rating
    Rating: require('./rating/rating.model'),

    //Restaurant
    Restaurant: require('./restaurant/restaurant.model'),
    RestaurantItem: require('./restaurant/restaurantitem.model'),

    //Role
    Role: require('./role/role.model'),

    //Service
    Service: require('./service/service.model'),

    //Tag
    Tag: require('./tag/tag.model'),

    //User
    ActiveUser: require('./user/active-user.model'),
    User: require('./user/user.model'),
    UserDeviceInfo: require('./user/userdeviceinfo.model'),
    UserFriend: require('./user/user_friends.model'),
    UserRolePermission: require('./user/user_role_permission.model'),

    Rate: require('./rate/rate.model'),
    RatemeTrending: require('./rate/rateme_trending.model'),
    RateComment: require('./rate/rate_comment.model'),
};