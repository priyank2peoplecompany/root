const rate_commentSchema = new Schema({
    rate_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'rates',
    },
    user_id: {
        type: String,
        required: [true],
    },
    parent_id: {
        type: String,
    },
    comment: {
        type: String,
        required: [true]
    },
    file: {
        type: String,
        get: getFullUrl,
    },
    reacted: [{
        reaction: { type: String, default: '' },
        created_at: { type: Date, default: Date.now },
        users: {
            type: mongoose.Schema.Types.ObjectId, // pass userid
            ref: 'users',
            default: null
        }
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

rate_commentSchema.plugin(mongoose_delete, { deletedBy: false });

rate_commentSchema.pre('findOne', autoPopulateChild).pre('find', autoPopulateChild);

rate_commentSchema.virtual('comment_by', {
    ref: 'users',
    localField: 'user_id',
    foreignField: '_id',
    justOne: true,
});

const RateComment = mongoose.model('rate_comments', rate_commentSchema);

module.exports = RateComment;

function getFullUrl(url) {
    if (url != undefined && url != '') return `${process.env.ASSETS_URL}uploads/${url}`;
    else return '';
}

function autoPopulateChild(next) {

    this.populate('child_comments')
        .populate('comment_by', { '_id': 1, 'name': 1 })
        .populate('reacted_by', { '_id': 1, 'reaction': 1, 'user_id': 1, });
    next();
}

