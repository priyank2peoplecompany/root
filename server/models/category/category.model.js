const { model } = require('mongoose');
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
    design:[{
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
        },
        created_at: { type: Date,default: Date.now },
        updated_at: {type: Date,default: Date.now }    
    }],
    children: [{
        name: { type: String, default: '' },
        images: { type: Array, default: '' },
        design:[{
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
            },
            created_at: { type: Date,default: Date.now },
            updated_at: {type: Date,default: Date.now }    
        }],
        created_at: { type: Date,default: Date.now },
        updated_at: {type: Date,default: Date.now }    
    }]    
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

categorySchema.plugin(mongooseLeanGetters);
categorySchema.plugin(mongoose_delete, { deletedBy: false });
const Category = mongoose.model('categories', categorySchema);

module.exports = Category;