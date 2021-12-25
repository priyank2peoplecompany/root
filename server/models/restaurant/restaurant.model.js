const restaurantSchema = new Schema({
    user_id: {
        type: String, // pass userid
        required: [true]
    },
    name: {
        type: String,
        rquired: true,
    },
    description: {
        type: String,
    },
    logo: {
        type: String,
        get: getFullUrl,
    },
    cover_image: {
        type: String,
        get: getFullUrl,
    },
    location: {
        type: JSON
    },
    working_hours: [{
        start: { type: Number },
        end: { type: Number }
    }],
    pure_veg: {
        type: Boolean,
        default: false // True , False
    },
    available: {
        type: Boolean,
        default: false // True , False
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

restaurantSchema.plugin(mongoose_delete, { deletedBy: false });

restaurantSchema.virtual('created_by', {
    ref: 'users',
    localField: 'user_id',
    foreignField: '_id',
    justOne: true,
});

restaurantSchema.virtual('items', {
    ref: 'restaurant_items',
    localField: '_id',
    foreignField: 'restaurant_id',
    justOne: false,
});

const Restaurant = mongoose.model('restaurants', restaurantSchema);
module.exports = Restaurant;

function getFullUrl(url) {
    if (url != undefined) return `${process.env.ASSETS_URL}uploads/${url}`;
    else return '';

}