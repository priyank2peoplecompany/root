const userrolepermissionSchema = new Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true],
        ref: 'users'
    },
    role_id: {
        type: Array,
        rquired: true,
    },
    module: {
        type: String,
        rquired: true,
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

userrolepermissionSchema.plugin(mongoose_delete, { deletedBy: false });

const UserRolePermission = mongoose.model('user_role_permission', userrolepermissionSchema);

module.exports = UserRolePermission;