const chatRoomHooks = require('./hooks/chat-room.hook');
const chatroomSchema = new Schema({
    name: {
        type: String,
        //required: [true],
    },
    logo: {
        type: String,
        get: getFullUrl,
    },
    description: {
        type: String,
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId, // pass userid
        ref: 'users',
        required: [true]
    }],
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    message_id: {
        type: String,
    },
    lastmessage_date: {
        type: String,
        default: ''
    },
    type: {
        type: Number,
        required: [true],
        default: 1  //  ( 0 = Private Group , 1 = Public Group)
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

chatroomSchema.plugin(mongoose_delete, { deletedBy: false });

chatroomSchema.virtual('message', {
    ref: 'chat_messages',
    localField: 'message_id',
    foreignField: '_id',
    justOne: true
});


chatroomSchema.virtual('count', {
    ref: 'chat_messages',
    localField: '_id',
    foreignField: 'room_id',
    justOne: false,
    count: true
});

chatroomSchema.post('save', function (chatRoomObj) {
    if (chatRoomObj.type != 0) {
        chatRoomHooks.addToChatRoomFlag(chatRoomObj);
    }
});

const ChatRoom = mongoose.model('chat_rooms', chatroomSchema);

module.exports = ChatRoom;

function getFullUrl(url) {
    if (url != undefined) return `${process.env.ASSETS_URL}uploads/${url}`;
    else return '';
}
