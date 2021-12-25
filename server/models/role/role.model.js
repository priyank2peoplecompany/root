const roleSchema = new Schema({
    type: {
        type: String,
        rquired: true,
    },
    type_code: {
        type: String,
        rquired: true,
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

roleSchema.plugin(mongoose_delete, { deletedBy: false });

const Role = mongoose.model('roles', roleSchema);

module.exports = Role;