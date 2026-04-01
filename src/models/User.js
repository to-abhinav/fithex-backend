const {mongoose} = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    role:{
        type: String,
        enum: ['member', 'owner'],
        default: 'member',
    },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
