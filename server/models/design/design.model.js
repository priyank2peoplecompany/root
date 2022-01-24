const mongooseLeanGetters = require('mongoose-lean-getters');
const DesignSchema = new Schema({
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories',
    },
    title:{
        type:String,
        default:''
    },
    image: {
        type: String,
        rquired: true,
    },
    thumb_image: {
        type: String,
        default: '',
    },
    html: {
        type: String,
        default: '',
    },
    isVideo:{
        type:Boolean,
        default:false
    },
    language:{
        type: String,
        enum:['Gujarati', 'Hindi', 'English'],
        default: 'English',
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

DesignSchema.plugin(mongooseLeanGetters);
DesignSchema.plugin(mongoose_delete, { deletedBy: false });
const Design = mongoose.model('category_designs', DesignSchema);

module.exports = Design;