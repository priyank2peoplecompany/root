const pushnotificationSchema = new Schema({
    userid: {
        type: String,
        required: [true],
        ref: 'users'
    },
    target_user: {
        type: String,
        required: [true]
    },
    devicetype: {
        type: String,
        required: [true]
    },
    title: {
        type: String,
        required: [true]
    },
    message: {
        type: String,
        required: [true]
    },
    environment: {
        type: String,
        default: 'development',
        required: [true]  // Development Or Production
    },
    image: {
        type: String,
        get: getFullUrl,
    },
    data: {
        type: String
    },
    dataType: {
        type: String
    },
    notification_type: {
        type: String
    },
    notification_data: {
        type: JSON
    },
    silent: {
        type: Boolean,
        default: false
    },
    expirationTime: {
        type: String,
    },
    status: {
        type: String,
        default: "Done" // Status : Pending or Done
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}, {
        versionKey: false,
        toObject: {
            getters: true
        },
        toJSON: {
            getters: true
        },
    });


const Pushnotification = mongoose.model('pushnotification', pushnotificationSchema);

// make this available to our users in our Node applications
module.exports = Pushnotification;

function getFullUrl(url) {
    return `${process.env.ASSETS_URL}${url}`;
}