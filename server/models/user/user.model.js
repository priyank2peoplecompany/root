const mongooseLeanGetters = require('mongoose-lean-getters');
const userSchema = new Schema({
    name: {
        type: String,
        //rquired: true,
    },
    phone: {
        type: String,
        rquired: true,
        unique: true,
        //get: getFullUrl,
    },
    phone2: {
        type: String,
        default: null,
    },
    category_ids: [{        
        type: mongoose.Schema.Types.ObjectId,
        required: [true],
        ref: 'categories'        
    }],
    user_otp: {
        type: JSON,
        default:null
    },
    company: {
        type: String,
        default: null 
    },
    slogan: {
        type: String,
        default: null 
    },
    address: {
        type: String,
        default: null 
    },
    website: {
        type: String,
        default: null
    },
    email: {
        type: String,
        default: null 
    },
    Social: {
        type: Array,
        default: null
    },
    products: {
        type: Array,
        default:null
    },
    icon: {
        type: String,
        default: null 
    },
    photos: {
        type: Array,
        default: null 
    },
    device_id: {
        type: String,
        default: null 
    },
    device_type: {
        type: String,
        default: null 
    }   
}, {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        versionKey: false,
        toObject: {
            getters: true
        },
        toJSON: {
            getters: true
        },
    }
);

userSchema.plugin(mongooseLeanGetters);
userSchema.plugin(mongoose_delete, { deletedBy: false });
const User = mongoose.model('users', userSchema);

module.exports = User;