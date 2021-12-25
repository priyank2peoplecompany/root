const community_commentSchema = new Schema({
    community_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'feeds',
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

community_commentSchema.plugin(mongoose_delete, { deletedBy: false });

community_commentSchema.pre('findOne', autoPopulateChild).pre('find', autoPopulateChild);

community_commentSchema.virtual('comment_by', {
    ref: 'users',
    localField: 'user_id',
    foreignField: '_id',
    justOne: true,
});

const CommunityComment = mongoose.model('community_comments', community_commentSchema);

module.exports = CommunityComment;

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

