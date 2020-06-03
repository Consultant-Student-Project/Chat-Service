const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema({
    from: {
        type: String,
        required: true,
        index: {
            unique: true,
        }
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