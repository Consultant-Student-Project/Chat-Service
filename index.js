const express = require("express");
const io = require("socket.io")(80);
const fetch = require("node-fetch")

var app = express();

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
                if (socketMap[msg.to]) {
                    socketMap[msg.to].emit("message", msg)
                    socket.emit("message", msg)
                }
            });

            socket.on("disconnection", () => {
                // TODO: çıkış tarihini tut ya da güncelle
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