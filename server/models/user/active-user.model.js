const ActiveUserSchema = new Schema({
    socket_id: {
        type: String,
        required: [true],
    },
    room_id: {
        type: mongoose.Schema.Types.ObjectId, // pass room id
        ref: 'chat_rooms',
        required: [true],
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId, // pass userid
        ref: 'users',
        required: [true],
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

ActiveUserSchema.plugin(mongoose_delete, { deletedBy: false });

const ActiveUser = mongoose.model('active_users', ActiveUserSchema);

module.exports = ActiveUser;