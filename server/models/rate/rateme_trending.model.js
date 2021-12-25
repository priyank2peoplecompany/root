const rateTrendingSchema = new Schema({
    rate_id: {
        type: mongoose.Schema.Types.ObjectId, // pass userid
        ref: 'rates'
    },
    total_rate:{
        type:Number
    },
    created_at: {
        type: Date,
        default: Date.now
    } 
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
rateTrendingSchema.plugin(mongoose_delete, { deletedBy: false });
const RateTrending = mongoose.model('rateme_trending', rateTrendingSchema);
module.exports = RateTrending;