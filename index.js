const express = require("express");
const io = require("socket.io")(80);
const fetch = require("node-fetch")
const mongoose = require("mongoose")
const message = require("./modals/Message");
const lastOnline = require("./modals/LastOnline");

var app = express();

mongoose.connect("mongodb://localhost:27017/ConsultantStudentProject", { useNewUrlParser: true });
var db = mongoose.connection;
db.once("open", function () {
    console.log("MongoDB connected correctly.")
})

app.use(express.static('public'))

let socketMap = {};
let id = 0;
let messages = [];

io.on('connection', socket => {
    console.log("socket connected");
    socket.on("authHandShake", token => {
        authHandShake(token, response => {

            // TODO: last online ı kontrol et
            // TODO: okunmamışları yolla
            if (!response.username) {
                return
            }
            console.log(response.username)
            socketMap[response.username] = socket
            socket.emit("authHandShake", {
                username: response.username
            })


            // Client id'sini almış oluyor
            socket.on("message", msg => {
                // TODO: mesajı database e yaz
                var message = new Message({
                    from: msg.from,
                    to: msg.to,
                    sendDate: Date.now()
                });
                messages.save(function (err, doc) {
                    if (err) return console.log(err);
                    console.log("Message saved");
                })
                if (socketMap[msg.to]) {
                    socketMap[msg.to].emit("message", msg)
                    socket.emit("message", msg)
                }
            });

            socket.on("disconnection", () => {
                // TODO: çıkış tarihini tut ya da güncelle
                LastOnline.count({ userName: response.username }, function (err, result) {
                    if (result > 0) {
                        LastOnline.findOneAndUpdate({ userName: response.username }, { lastOnline: Date.now() })
                    }
                })
                delete socketMap[response.username]
            });
        })
    })
})

function authHandShake(token, cb) {
    console.log(process.env.S2S_authkey)
    fetch('http://localhost:3000/resolve', {
        method: 'post',
        body: JSON.stringify({ token }),
        headers: { 'Content-Type': 'application/json', 'x-server-auth-key': process.env.S2S_authkey },
    })
        .then(res => res.json())
        .then(json => cb(json))
        .catch(err => console.log(err));
}







app.listen(8080);