const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

const PORT = process.env.PORT || 3000;
let waitingUsers = [];

app.get('/', (req, res) => {
    res.send('Backend is running');
});

io.on('connection', (socket) => {
    socket.on('find-stranger', () => {
        waitingUsers = waitingUsers.filter(user => user.id !== socket.id);
        if (waitingUsers.length > 0) {
            let partnerSocket = waitingUsers.shift();
            socket.emit('matched', { isInitiator: true, partnerId: partnerSocket.id });
            partnerSocket.emit('matched', { isInitiator: false, partnerId: socket.id });
            socket.partnerId = partnerSocket.id;
            partnerSocket.partnerId = socket.id;
        } else {
            waitingUsers.push(socket);
            socket.emit('waiting', '🔍 Finding a match...');
        }
    });

    socket.on('signal', (data) => {
        io.to(data.to).emit('signal', { from: socket.id, signal: data.signal });
    });

    socket.on('disconnect', () => {
        waitingUsers = waitingUsers.filter(user => user.id !== socket.id);
        if (socket.partnerId) {
            io.to(socket.partnerId).emit('partner-disconnected');
        }
    });
});

http.listen(PORT, () => { console.log(`Backend Active on port ${PORT}`); });
