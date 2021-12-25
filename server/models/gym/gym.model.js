const gymSchema = new Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true],
        ref: 'users'
    },
    title: {
        type: String,
        required: [true],
    },
    description: {
        type: String,
    },
    logo: {
        type: String,
        default: '',
        get: getFullUrl,
    },
    banner: {
        type: String,
        default: '',
        get: getFullUrl,
    },
    email: {
        type: String,
    },
    phone: {
        type: Number,
    },
    siteurl: {
        type: String,
    },
    address: {
        full_address: { type: String, default: "" },
        place_id: { type: String, default: "" },
        formatted_address: { type: String, default: "" },
        area: { type: String, default: "" },
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        country: { type: String, default: "" },
        pincode: { type: String, default: "" },
        location: { type: { type: String, enum: ['Point'], default: "Point" }, coordinates: { type: [Number], default: [] } }
        //coordinate: { type: { type: String, default: "Point" }, long: { type: String, default: "" } },
    },
    gym_fees: [{
        days: { type: Number, default: 0 },
        fees: { type: Number, default: 0 },
    }],
    is_free_days: {
        type: Boolean,
        rquired: [true],
        default: false // True , False
    },
    gym_photos: {
        type: Array,
        get: getArrayFullUrl,
    },
    gym_videos: {
        type: Array,
        get: getArrayFullUrl,
    },
    rating: {
        total: { type: Number, default: 0 },
        average: { type: Number, default: 0 },
    },
    amenities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'amenities',
    }],
    services: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'services',
    }],
    machinaries: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'machines',
    }],
    working_time: {
        type: JSON,
    },
    is_verified: {
        type: Boolean, // (True ,False)
        default: false,
    },
    status: {
        type: Number, // ( 0 = Pending , 1=Approved , 2 = Disapproved)
        default: 0,
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

gymSchema.plugin(mongoose_delete, { deletedBy: false });

gymSchema.index({ "address.location": "2dsphere" });

gymSchema.virtual('ratings', {
    ref: 'ratings',
    localField: '_id',
    foreignField: 'rating_id',
    justOne: false
});

const Gym = mongoose.model('gyms', gymSchema);

module.exports = Gym;

function getArrayFullUrl(data) {
    if (data.length > 0) {
        let returndata = [];
        data.forEach(element => {
            returndata.push(`${process.env.ASSETS_URL}uploads/${element}`);
        });
        return returndata;
    }
}

function getFullUrl(url) {
    if (url != undefined) return `${process.env.ASSETS_URL}uploads/${url}`;
    else return '';
}