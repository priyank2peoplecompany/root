const mongooseLeanGetters = require('mongoose-lean-getters');
const userSchema = new Schema({
    role_id: {
        type: String,
        required: [true],
        ref: 'roles'
    },
    name: {
        type: String,
        //rquired: true,
    },
    profile_pic: {
        type: String,
        get: getFullUrl,
    },
    email: {
        type: String,
        //rquired: true,
    },
    password: {
        type: String,
    },
    phone: {
        type: Number,
        unique: true,
        rquired: [true],
    },
    user_otp: {
        type: JSON,
    },
    is_online: {
        type: Boolean,
        rquired: true,
        default: false // True , False
    },
    is_profile_complete: {
        type: Boolean,
        rquired: [true],
        default: false // True , False
    },
    gender: {
        type: Number, // 0 - Male , 1 - Female , 2 - Other
    },
    birthdate: {
        type: Date,
    },
    height: {
        type: Number,
    },
    unread: {
        type: Number,
        default: 0
    },
    weight: {
        type: Number,
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

userSchema.plugin(mongooseLeanGetters);
userSchema.plugin(mongoose_delete, { deletedBy: false });
const User = mongoose.model('users', userSchema);

module.exports = User;

function getFullUrl(url) {
    if (url != undefined) return `${process.env.ASSETS_URL}uploads/${url}`;
    else return '';

}