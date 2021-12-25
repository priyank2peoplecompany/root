const fitness_live_commentSchema = new Schema({
    fitnesslive_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'fitness_lives',
    },
    added_by: {
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
        reaction: { type: String },
        users: { type: String },
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

fitness_live_commentSchema.plugin(mongoose_delete, { deletedBy: false });

fitness_live_commentSchema.pre('findOne', autoPopulateChild).pre('find', autoPopulateChild);

fitness_live_commentSchema.virtual('comment_by', {
    ref: 'users',
    localField: 'user_id',
    foreignField: '_id',
    justOne: true,
});

fitness_live_commentSchema.virtual('reacted_by', {
    ref: 'user_reactions',
    localField: '_id',
    foreignField: 'comment_id',
    justOne: false,
});

const FitnessLiveComment = mongoose.model('fitness_live_comments', fitness_live_commentSchema);

module.exports = FitnessLiveComment;

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

