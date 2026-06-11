const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

const PORT = process.env.PORT || 3000;

// Separate queues for each gender
let boysQueue = [];
let girlsQueue = [];

// Track active matches: socketId -> partnerSocketId
const activeMatches = {};

app.get('/', (req, res) => {
    res.send('Backend is running');
});

// Helper: create a room, record the match, and notify both peers
function matchUsers(socket1, socket2) {
    const roomId = `${socket1.id}-${socket2.id}`;
    socket1.join(roomId);
    socket2.join(roomId);

    activeMatches[socket1.id] = socket2.id;
    activeMatches[socket2.id] = socket1.id;

    // socket1 is the waiting user (already in queue), so they become the initiator
    socket1.emit('match_found', {
        roomId,
        partnerId: socket2.id,
        partnerName: socket2.userName,
        isInitiator: true
    });

    socket2.emit('match_found', {
        roomId,
        partnerId: socket1.id,
        partnerName: socket1.userName,
        isInitiator: false
    });

    console.log(`Matched: ${socket1.id} (${socket1.userGender}/${socket1.userName}) <-> ${socket2.id} (${socket2.userGender}/${socket2.userName}) in room ${roomId}`);
}

io.on('connection', (socket) => {
    console.log('User connected: ' + socket.id);

    // Client sends { gender: 'boy'|'girl', name: string }
    socket.on('start_match', ({ gender, name }) => {
        socket.userGender = gender;
        socket.userName = name;

        // Remove any stale entries for this socket from both queues
        boysQueue = boysQueue.filter(s => s.id !== socket.id);
        girlsQueue = girlsQueue.filter(s => s.id !== socket.id);

        if (gender === 'boy') {
            if (girlsQueue.length > 0) {
                const partner = girlsQueue.shift();
                matchUsers(partner, socket);
            } else {
                boysQueue.push(socket);
                socket.emit('waiting', '🔍 Looking for a match...');
                console.log(`Boy ${socket.id} added to boysQueue (queue size: ${boysQueue.length})`);
            }
        } else if (gender === 'girl') {
            if (boysQueue.length > 0) {
                const partner = boysQueue.shift();
                matchUsers(partner, socket);
            } else {
                girlsQueue.push(socket);
                socket.emit('waiting', '🔍 Looking for a match...');
                console.log(`Girl ${socket.id} added to girlsQueue (queue size: ${girlsQueue.length})`);
            }
        } else {
            socket.emit('error', 'Invalid gender. Must be "boy" or "girl".');
        }
    });

    // WebRTC signaling — forward signal data to the intended recipient
    socket.on('send_signal', ({ to, signal }) => {
        io.to(to).emit('receive_signal', { from: socket.id, signal });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected: ' + socket.id);

        // Remove from whichever queue they may be waiting in
        boysQueue = boysQueue.filter(s => s.id !== socket.id);
        girlsQueue = girlsQueue.filter(s => s.id !== socket.id);

        // Notify active partner, if any
        const partnerId = activeMatches[socket.id];
        if (partnerId) {
            io.to(partnerId).emit('partner_disconnected');
            delete activeMatches[partnerId];
        }
        delete activeMatches[socket.id];
    });
});

http.listen(PORT, "0.0.0.0", () => { console.log(`Backend Active on port ${PORT}`); });
