const fitness_liveSchema = new Schema({
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
    video: {
        type: String,
        get: getFullUrl
    },
    tags: [{
        type: mongoose.Schema.Types.ObjectId, // pass userid
        ref: 'tags'
    }],
    type: {
        type: Number // 0 = Video , 1 - Photo , 2 - Community        
    },
    reacted: [{
        reaction: { type: String },
        users: {
            type: mongoose.Schema.Types.ObjectId, // pass userid
            ref: 'users'
        },
        created_at: { type: Date, default: Date.now }
    }],
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

fitness_liveSchema.plugin(mongoose_delete, { deletedBy: false });

fitness_liveSchema.virtual('like_count').get(function () { return this.reacted.length; });

const Fitnesslive = mongoose.model('fitness_lives', fitness_liveSchema);

module.exports = Fitnesslive;

function getFullUrl(url) {
    if (url != undefined) return `${process.env.ASSETS_URL}uploads/${url}`;
    else return '';
}