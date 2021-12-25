const chatMessageHooks = require('./hooks/chat-message.hook');
const chatmessageSchema = new Schema({
    room_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true],
        ref: 'chat_rooms'
    },
    senderid: {
        type: String,
        required: [true],
    },
    message: {
        type: String,
        required: [false],
    },
    files: [{
        name: { type: String, default: '' },
        size: { type: Number, default: 0 },
        type: { type: String, default: '' }
    }],
    extra: {
        type: String,
    },
    receiverid: [{
        type: mongoose.Schema.Types.ObjectId, // pass userid
        ref: 'users',
        required: [true],
    }],
    unreaduserid: [{
        type: mongoose.Schema.Types.ObjectId, // pass userid
    }],
    type: {
        type: Number,
        required: [true],
        default: 1  //  ( 0 = System Message , 1 = User Message)
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

chatmessageSchema.plugin(mongoose_delete, { deletedBy: false });

chatmessageSchema.post('save', function (chatMessageObj) {
    chatMessageHooks.addToChatMessageFlag(chatMessageObj);
});

chatmessageSchema.path('files').get(function (data) {
    if (data.length > 0) {
        return data.map(element => ({ size: element.size, type: element.type, name: `${process.env.ASSETS_URL}uploads/${element.name}` }));
    }
});

chatmessageSchema.virtual('sender', {
    ref: 'users',
    localField: 'senderid',
    foreignField: '_id',
    justOne: true
});

chatmessageSchema.virtual('count', {
    ref: 'users',
    localField: 'unreaduserid',
    foreignField: '_id',
    justOne: false,
    count: true
});

const ChatMessage = mongoose.model('chat_messages', chatmessageSchema);

module.exports = ChatMessage;

function getFullUrl(data) {
    console.log("HERE====================>", data);
    if (data.length > 0) {
        let returndata = [];
        data.forEach(element => {
            returndata.push(`${process.env.ASSETS_URL}uploads/${element}`);
        });
        return returndata;
    }
}