const userFriendHooks = require('./hooks/user-friend.hook');
const user_friendSchema = new Schema({
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true],
        ref: 'users'
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true],
        ref: 'users'
    },
    status: {
        type: Number, // Pending = 1 , Accepted = 2 , Rejected = 3 
        default: 1
    },
    is_blocked: {
        type: Boolean, // Yes = True , No = False
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
}, {
        versionKey: false,
        toObject: {
            getters: true
        },
        toJSON: {
            getters: true
        },
    }
);

user_friendSchema.plugin(mongoose_delete, { deletedBy: false });

user_friendSchema.post('save', function (userFriendObj) {
    userFriendHooks.sendFriendRequest(userFriendObj);
});

const UserFriend = mongoose.model('user_friends', user_friendSchema);

module.exports = UserFriend;