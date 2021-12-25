const ratingHooks = require('./hooks/rating.hook');
const RatingSchema = new Schema({
    user_id: {
        type: String, // pass userid
        required: [true]
    },
    rating_id: {
        type: String, // pass trainer or gym id
        required: [true]
    },
    type: {
        type: Number, // 0 - gym , 1- trainer
        required: [false]
    },
    rating: {
        type: Number
    },
    message: {
        type: String
    },
    files: {
        type: JSON,
        default: [],
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

RatingSchema.plugin(mongoose_delete, { deletedBy: false });

RatingSchema.post('save', function (ratingObj) {
    ratingHooks.addToRatingFlag(ratingObj);
});

RatingSchema.virtual('rating_by', {
    ref: 'users',
    localField: 'user_id',
    foreignField: '_id',
    justOne: true,
});

RatingSchema.path('files').get(function (data) {
    if (data.length > 0) {
        return data.map(element => ({ size: element.size, type: element.type, name: `${process.env.ASSETS_URL}uploads/${element.name}` }));
    }
});
const Rating = mongoose.model('ratings', RatingSchema);
module.exports = Rating;
