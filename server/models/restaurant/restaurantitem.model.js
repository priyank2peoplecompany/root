const restaurantItemSchema = new Schema({
    restaurant_id: {
        type: String, // pass restaurantid
        required: [true]
    },
    name: {
        type: String,
        rquired: true,
    },
    description: {
        type: String,
    },
    ingredients : { 
        type: [String],
    },
    image: {
        type: String,
        get: getFullUrl,
    },
    price:{
        type: Number,default: 0
    },
    preparation_time:{
        type: Number,default: 0
    },
    nutrition: { 
         calories : { type: Number,default: 0 },
         fat : { type: Number,default: 0 } ,
         carbohydrates : { type: Number,default: 0 } 
    },
    add_ons: [{
        item_name : { type: String,default: '' },
        description : { type: String,default: '' },
        price : { type: String,default: '' },
        quantity: { type: Number,default: 0 },
        nutrition: { 
            calories : { type: Number,default: 0 },
            fat : { type: Number,default: 0 } ,
            carbohydrates : { type: Number,default: 0 } 
        }
    }],
    veg: {
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

restaurantItemSchema.plugin(mongoose_delete, { deletedBy: false });

restaurantItemSchema.virtual('restaurant', {
    ref: 'restaurants',
    localField: 'restaurant_id',
    foreignField: '_id',
    justOne: true,
});

const RestaurantItem = mongoose.model('restaurant_items', restaurantItemSchema);
module.exports = RestaurantItem;

function getFullUrl(url) {
    if (url != undefined) return `${process.env.ASSETS_URL}uploads/${url}`;
    else return '';

}