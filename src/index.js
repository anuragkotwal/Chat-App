const express = require('express')
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const {generatedMsg, generatedLocationMsg} = require('./utils/msg');
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users');

const app = express()
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

let msg = 'Welcome user!'

io.on('connection', (socket) => {
    console.log('new websocket connection')

    socket.on('join',({username, room},callback) => {
        const {error,user} = addUser({id: socket.id, username, room});
        if(error){
            return callback(error);
        }
        socket.join(user.room);
        socket.emit('message',generatedMsg(msg,'Admin'));
        const uname = user.username.charAt(0).toUpperCase() + user.username.slice(1);
        socket.broadcast.to(user.room).emit('message',generatedMsg(`${uname} has joined!`,'Admin'));

        io.to(user.room).emit('room',{
            room: user.room,
            users: getUsersInRoom(user.room),
        })

        callback();
    })

    socket.on('sendMessage',(message,callback) => {
        const user = getUser(socket.id);
            // user.username = user.username.charAt(0).toUpperCase() + user.username.slice(1);
            io.to(user.room).emit('message',generatedMsg(message,user.username));
            callback();
    })
    socket.on('sendlocation',(coords,callback) => {
        const user = getUser(socket.id);
        user.username = user.username.charAt(0).toUpperCase() + user.username.slice(1);
        io.to(user.room).emit('locationMsg',generatedLocationMsg(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`,user.username));
        callback();
    })
    socket.on('disconnect', () =>{
        const user = removeUser(socket.id);
        if(user){
            user[0].username = user[0].username.charAt(0).toUpperCase() + user[0].username.slice(1);
            io.to(user[0].room).emit('message',generatedMsg(`${user[0].username} has left!`,'Admin'));
            io.to(user[0].room).emit('room',{
                room: user[0].room,
                users: getUsersInRoom(user[0].room),
            })
        }
    })
})

server.listen(port, () => {
    console.log('Server listening on port '+port);
})