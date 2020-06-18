const express = require("express");
var app = express();
var server = app.listen(8080);
const io = require("socket.io").listen(server);
const fetch = require("node-fetch")
const mongoose = require("mongoose")
const Message = require("./modals/Message");
const LastOnline = require("./modals/LastOnline");
const cors = require("cors");

app.use(cors({ credentials: true, origin: 'http://127.0.0.1:8887' }))



mongoose.connect("mongodb://mongo:27017/ConsultantStudentProject", { useNewUrlParser: true });
var db = mongoose.connection;
db.once("open", function () {
    console.log("MongoDB connected correctly.")
})



let socketMap = {};
let id = 0;
let messages = [];

io.on('connection', socket => {

    socket.on("authHandShake", token => {
        authHandShake(token, response => {
            console.log(response.username + " connected");

            if (!response.username) {
                return
            }
            console.log(response.username)
            // TODO: last online ı kontrol et
            LastOnline.count({ userName: response.username }, function (err, result) {
                if (result > 0) {
                    LastOnline.findOne({ userName: response.username }, (err, result) => {
                        if (err) {
                            console.error(err)
                            return
                        }
                        let lastOnlineTime = result.lastOnline
                        console.log(lastOnlineTime)
                        // TODO: okunmamışları yolla
                        Message.find({ sendDate: { $gte: lastOnlineTime }, to: response.username }).sort({ sendDate: 1 }).exec((err, documents) => {
                            socket.emit("offlineMessages", documents)
                        });
                    })


                }
            });





            socketMap[response.username] = socket
            socket.emit("authHandShake", {
                username: response.username
            })


            // Client id'sini almış oluyor
            socket.on("message", msg => {
                // TODO: mesajı database e yaz
                var message = new Message({
                    content: msg.content,
                    from: msg.from,
                    to: msg.to,
                    sendDate: Date.now()
                });
                message.save(function (err, doc) {
                    if (err) return console.log(err);
                    console.log("Message saved");
                })
                if (socketMap[msg.to]) {
                    socketMap[msg.to].emit("message", msg)
                }
                socket.emit("message", msg)
            });

            socket.on("disconnect", function () {
                console.log(response.username + " disconnect from socket")
                // TODO: çıkış tarihini tut ya da güncelle
                LastOnline.count({ userName: response.username }, function (err, result) {
                    if (result > 0) {
                        LastOnline.findOneAndUpdate({ userName: response.username }, { lastOnline: Date.now() }, (err, documents) => {
                            if (err) {
                                console.error(err)
                                return
                            }
                        })
                    } else {
                        LastOnline.create({ userName: response.username, lastOnline: Date.now() }, function (err, username) {
                            if (err) return handleError(err);
                            // saved!
                        });
                    }
                })
                delete socketMap[response.username]
            });
        })
    })
})

function authHandShake(token, cb) {
    console.log(process.env.S2S_authkey)
    fetch('http://authentication:3000/resolve', {
        method: 'post',
        body: JSON.stringify({ token }),
        headers: { 'Content-Type': 'application/json', 'x-server-auth-key': process.env.S2S_authkey },
    })
        .then(res => res.json())
        .then(json => cb(json))
        .catch(err => console.log(err));
}