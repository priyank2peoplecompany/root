const communitySchema = new Schema({
    title: {
        type: String,
        required: [true],
    },
    added_by: {
        type: mongoose.Schema.Types.ObjectId, // pass userid
        ref: 'users'
    },
    description: {
        type: String,
        default: ''
    },
    photos: {
        type: JSON,
        get: getFullUrl,
        default: [],
    },
    videos: {
        type: JSON,
        get: getFullUrl,
        default: [],
    },
    tags: [{
        type: mongoose.Schema.Types.ObjectId, // pass userid
        ref: 'tags'
    }],
    reacted: [{
        reaction: { type: String },
        created_at: { type: Date, default: Date.now },
        users: {
            type: mongoose.Schema.Types.ObjectId, // pass userid
            ref: 'users'
        }
    }],
    total_comments: {
        type: Number,
        default: 0,
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

communitySchema.plugin(mongoose_delete, { deletedBy: false });

communitySchema.virtual('like_count').get(function () { return this.reacted.length; });

const Community = mongoose.model('communities', communitySchema);

module.exports = Community;

function getFullUrl(data) {
    if (data.length > 0) {
        let returndata = [];
        data.forEach(element => {
            returndata.push(`${process.env.ASSETS_URL}uploads/${element}`);
        });
        return returndata;
    }
}