const path = require('path');
const http = require('http');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
const express = require('express');
const socketIO = require('socket.io');

let app = express();
let server = http.createServer(app);
let io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.emit('newMessage', {
        from: 'Admin',
        text: "Welcome to Moore's chat app",
        createdAt: new Date().getTime()
    });

    socket
        .broadcast
        .emit('newMessage', {
            from: 'Admin',
            text: 'New User Joined',
            createdAt: new Date().getTime()
        });

    socket.on('createMessage', function(newMessage) {
        console.log('Message Recieved', newMessage);
        io.emit('newMessage', {
                from: newMessage.from,
                text: newMessage.text,
                createdAt: new Date().getTime()
            })
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