var express = require('express');
var moment = require('moment');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname+'/public'));

app.get('/nicchat', function(req, res) {
    res.sendFile(__dirname+'/public/pages/chat/chat.html');
});

io.on('connection', function(socket) {
    console.log('user connected');

    socket.on('disconnect', function() {
        console.log('user disconnected');
    });

    socket.on('message', function(msg) {
        var msgData = {
            text:msg,
            timestamp:moment().format('h:mm a')
        };
        io.emit('message', msgData);
    })
});

server.listen(80, function() {
    console.log('listening on *:80');
});