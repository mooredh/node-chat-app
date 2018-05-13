const path = require('path');
const http = require('http');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
const express = require('express');
const socketIO = require('socket.io');
const { generateMessage } = require('./utils/message');

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
        console.log('Message Recieved', newMessage);
        io.emit('newMessage', generateMessage(newMessage.from, newMessage.text));
        //callback('This is from the server');
        /*socket
            .broadcast
            .emit('newMessage', {
                from: newMessage.from,
                text: newMessage.text,
                createdAt: new Date().getTime()
            })*/
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    })
})

server.listen(port, () => {
    console.log(`Started on port ${port}`);
});