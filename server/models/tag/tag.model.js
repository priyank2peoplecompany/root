const tagSchema = new Schema({
    tag: {
        type: String,
        rquired: true,
    },
    tagcode: {
        type: String,
        rquired: true,
    },
    enabled: {
        type: Boolean,
        rquired: true,
        default: true
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

tagSchema.plugin(mongoose_delete, { deletedBy: false });

const Tag = mongoose.model('tags', tagSchema);

module.exports = Tag;