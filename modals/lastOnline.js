const mongoose = require("mongoose")

const lastOnlineSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
    },
    lastOnline: {
        type: Date,
        required: true,
    },
})

var LastOnline = mongoose.model('LastOnline', lastOnlineSchema);

module.exports = LastOnline;