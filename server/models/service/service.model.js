const serviceSchema = new Schema({
    title: {
        type: String,
        rquired: true,
        unique: true
    },
    title_code: {
        type: String,
        rquired: true,
    },
    description: {
        type: String,
        rquired: true,
    },
    image: {
        type: String,
        get: getFullUrl,
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

serviceSchema.plugin(mongoose_delete, { deletedBy: false });

const Service = mongoose.model('services', serviceSchema);

module.exports = Service;

function getFullUrl(url) {
    if (url != undefined && url != '') return `${process.env.ASSETS_URL}uploads/${url}`;
    else return '';
}