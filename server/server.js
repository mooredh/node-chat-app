const path = require('path');
const http = require('http');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
const express = require('express');
const socketIO = require('socket.io');
const { generateMessage, generateLocationMessage } = require('./utils/message');

let app = express();
let server = http.createServer(app);
let io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('New user connected');
    socket.emit('newMessage', generateMessage('Admin', 'Welcome to Moore\'s chat app'));

    socket
        .broadcast
        .emit('newMessage', generateMessage('Admin', 'New user joined'));

    socket.on('createMessage', function(newMessage, callback) {
        io.emit('newMessage', generateMessage(newMessage.from, newMessage.text));
    });

    socket.on('createLocationMessage', (coords) => {
        io.emit('newLocationMessage', generateLocationMessage('Admin', coords.latitude, coords.longitude));
    })

    socket.on('disconnect', () => {
        console.log('User disconnected');
    })
})

server.listen(port, () => {
    console.log(`Started on port ${port}`);
});