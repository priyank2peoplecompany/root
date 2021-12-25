const userdeviceinfoSchema = new Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true],
        ref: 'users'
    },
    osversion: {
        type: String,
    },
    uuid: {
        type: String,
    },
    devicetoken: {
        type: String,
    },
    devicetype: {
        type: String,
    },
    devicemodel: {
        type: String,
    },
    build_version: {
        type: String,
    },
    country_code: {
        type: String,
    },
    manufacturar: {
        type: String,
    },
    isrooted: {
        type: Boolean, // True , False
    },
    last_active: {
        type: Date,
        default: Date.now
    },
    latitude: {
        type: String,
    },
    longitude: {
        type: String,
    },
    language: {
        type: String,
    },
    location: {
        type: JSON,
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

userdeviceinfoSchema.plugin(mongoose_delete, { deletedBy: false });

const UserDeviceInfo = mongoose.model('userdeviceinfo', userdeviceinfoSchema);

module.exports = UserDeviceInfo;