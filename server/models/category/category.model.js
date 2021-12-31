const mongooseLeanGetters = require('mongoose-lean-getters');
const categorySchema = new Schema({
    name: {
        type: String,
        unique: true,
        rquired: true,
    },
    images: {
        type: Array,
        rquired: true,
    },
    children: [{
        name: String,
        default:''
    },
    {
        images: String,
        default:''
    }],
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

categorySchema.plugin(mongooseLeanGetters);
categorySchema.plugin(mongoose_delete, { deletedBy: false });
const Category = mongoose.model('categories', categorySchema);

module.exports = Category;