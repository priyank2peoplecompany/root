const mongooseLeanGetters = require('mongoose-lean-getters');
//const ratemeHooks = require('./hooks/rateme.hook');
const rateSchema = new Schema({
    title: {
        type: String,
        required: [true],
    },
    
    description: {
        type: String,
    },
    by_user: {
        type: mongoose.Schema.Types.ObjectId, // pass userid
        ref: 'users'
    },
    rate_photo: {
        type: String,
        get: getFullUrl
       
    },  
    avg_rate:{
        type:Number,
        default:null
    },
    user_ratings: [{
        created_at:{
            type: Date,
            default: Date.now
        },
        users: {
            type: mongoose.Schema.Types.ObjectId, // pass userid
            ref: 'users'
        },
        rate:{
            type:Number
        }
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
rateSchema.plugin(mongooseLeanGetters);
rateSchema.plugin(mongoose_delete, { deletedBy: false });


// rateSchema.post('updateOne', async function() {
//     let ratemeObj = this.getQuery() 
//     console.log('test====>',ratemeObj)
//     return false;
//     ratemeHooks.updateAvgRate(this.getQuery());
// });


const Rate = mongoose.model('rates', rateSchema);
module.exports = Rate;

function getFullUrl(url) {  
    if (url != undefined) return `${process.env.ASSETS_URL}uploads/${url}`;
    else return '';
}
