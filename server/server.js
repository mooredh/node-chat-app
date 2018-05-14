const path = require('path');
const http = require('http');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
const express = require('express');
const socketIO = require('socket.io');
const { generateMessage, generateLocationMessage } = require('./utils/message');
const { isRealString } = require('./utils/validation');
const { Users } = require('./utils/users');

let app = express();
let server = http.createServer(app);
let io = socketIO(server);
let users = new Users();

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    socket.on('createMessage', function(msg, callback) {
        let user = users.getUser(socket.id);

        if (user && isRealString(msg.text)) {
            io.to(user.room).emit('newMessage', generateMessage(user.name, msg.text));
        }
    });

    socket.on('join', (params, callback) => {
        let room = params.room.toLowerCase();
        if (!isRealString(params.name) || !isRealString(params.room)) {
            return callback('Name and room name are required.');
        }

        let sameName = users.getUserList(room).filter(user => user.toLowerCase() == params.name.toLowerCase()).length;

        if (sameName > 0) {
            return callback('Username Taken');
        }

        socket.join(room);
        users.removeUser(socket.id);
        users.addUser(socket.id, params.name, room);

        io.to(room).emit('updateUserList', users.getUserList(room));
        socket.emit('newMessage', generateMessage('Admin', `Welcome to ${params.room} Chatroom`));

        socket
            .broadcast
            .to(room)
            .emit('newMessage', generateMessage('Admin', `${params.name} has joined the room.`));
        callback();
    })

    socket.on('createLocationMessage', (coords) => {
        let user = users.getUser(socket.id);

        if (user) {
            io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
        }
    })

    socket.on('disconnect', () => {
        let user = users.removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left the room`));
        }
    })
})

server.listen(port, () => {
    console.log(`Started on port ${port}`);
});