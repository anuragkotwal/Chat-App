const express = require('express')
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

const app = express()
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

let msg = 'Welcome user!'

io.on('connection', (socket) => {
    console.log('new websocket connection')
    socket.emit('message',msg);
    socket.broadcast.emit('message','A new user has joined!');
    socket.on('sendMessage',(message,callback) => {
        io.emit('message',message);
        callback();
    })
    socket.on('sendlocation',(coords,callback) => {
        io.emit('message',`https://google.com/maps?q=${coords.latitude},${coords.longitude}`);
        callback();
    })
    socket.on('disconnect', () =>{
        io.emit('message','A user has left!');
    })
})

server.listen(port, () => {
    console.log('Server listening on port '+port);
})