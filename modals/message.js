const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    from: {
        type: String,
        required: true,
    },
    to: {
        type: String,
        required: true,
    },
    sendDate: {
        type: Date,
        required: true,
    },
})

var Message = mongoose.model('Message', messageSchema);

module.exports = Message;