const trainer_serviceSchema = new Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true],
        ref: 'users'
    },
    description: {
        type: String,
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
        formatted_address: { type: String, default: "" },
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        country: { type: String, default: "" },
        pincode: { type: String, default: "" },
        coordinate: { lat: { type: String, default: "" }, long: { type: String, default: "" } },
    },
    fees: [{
        session: { type: Number, default: 0 },
        fees: { type: Number, default: 0 },
    }],
    is_free_days: {
        type: Boolean,
        rquired: [true],
        default: false // True , False
    },
    services: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'services',
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

trainer_serviceSchema.plugin(mongoose_delete, { deletedBy: false });

const Gym = mongoose.model('trainer_services', trainer_serviceSchema);

module.exports = Gym;

function getArrayFullUrl(data) {
    if (data.length > 0) {
        let returndata = [];
        data.forEach(element => {
            returndata.push(`${process.env.ASSETS_URL}uploads/gym/${element}`);
        });
        return returndata;
    }
}

function getFullUrl(url) {
    if (url != undefined) return `${process.env.ASSETS_URL}uploads/gym/${url}`;
    else return '';
}