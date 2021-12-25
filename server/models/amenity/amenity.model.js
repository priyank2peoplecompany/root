const amenitySchema = new Schema({
    title: {
        type: String,
        rquired: true,
        unique: [true, 'Title already exists'],
    },
    title_code: {
        type: String,
        rquired: true,
    },
    description: {
        type: String,
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

amenitySchema.plugin(mongoose_delete, { deletedBy: false });

const Amenity = mongoose.model('amenities', amenitySchema);

module.exports = Amenity;

function getFullUrl(url) {
    if (url != undefined && url != '') return `${process.env.ASSETS_URL}uploads/${url}`;
    else return '';
}