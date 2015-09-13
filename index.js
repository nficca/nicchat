var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
    res.sendFile(__dirname+'/chat.html');
});

io.on('connection', function(socket) {
    console.log('user connected');

    socket.on('disconnect', function() {
        console.log('user disconnected');
    });

    socket.on('message', function(msg) {
        io.emit('message', '[USER]: '+msg);
    })
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});