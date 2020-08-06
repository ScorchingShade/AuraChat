const express = require('express');
const app = express();
const server = require('http').Server(app);
const { v4: uuidv4 } = require('uuid');
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
})


app.use(express.static('public'));
app.use('/peerjs', peerServer);

app.set("view engine", "ejs")


app.get('/', (req, res) => {
    res.redirect(`${uuidv4()}`);
});

//using uuid, we are now being redirected to a room
app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
})

//using peer we are joining a room and passing two things, roomid and userid
io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).broadcast.emit('user-connected', userId);

        //listen for message
        socket.on('message', message => {
            io.to(roomId).emit('createMessage', message);
        })
    })
})

server.listen(process.env.PORT || 3030);