const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname, '/')));

// Alag-alag matching pools
let allUsers = []; 

io.on('connection', (socket) => {
    console.log('User Connected:', socket.id);

    socket.on('register', (data) => {
        socket.gender = data.gender;
        socket.preference = data.preference; 
        socket.isVIP = data.isVIP;
        socket.isMatched = false;

        // Purani list se hatakar fresh insert karna
        allUsers = allUsers.filter(u => u.id !== socket.id);
        allUsers.push(socket);

        findMatch(socket);
    });

    socket.on('signal', (data) => {
        io.to(data.to).emit('signal', { from: socket.id, signal: data.signal });
    });

    socket.on('disconnect', () => {
        allUsers = allUsers.filter(u => u.id !== socket.id);
    });
});

function findMatch(socket) {
    if (socket.isMatched) return;

    for (let partner of allUsers) {
        if (partner.id !== socket.id && !partner.isMatched) {
            
            // Checking Conditions for Matching
            let socketMatchesPartner = (socket.preference === "Random") || 
                                       (socket.preference === "Only Girl" && partner.gender === "Girl") || 
                                       (socket.preference === "Only Boy" && partner.gender === "Boy");

            let partnerMatchesSocket = (partner.preference === "Random") || 
                                       (partner.preference === "Only Girl" && socket.gender === "Girl") || 
                                       (partner.preference === "Only Boy" && socket.gender === "Boy");

            // Agar dono ki shartein aapas mein match ho jati hain
            if (socketMatchesPartner && partnerMatchesSocket) {
                socket.isMatched = true;
                partner.isMatched = true;

                // Match connect command bhejna
                socket.emit('matched', { partnerId: partner.id, createOffer: true, partnerGender: partner.gender });
                partner.emit('matched', { partnerId: socket.id, createOffer: false, partnerGender: socket.gender });

                // Pool se dono ko remove kar dena taaki naya match na mile beech mein
                allUsers = allUsers.filter(u => u.id !== socket.id && u.id !== partner.id);
                break;
            }
        }
    }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`VIP Engine Active on Port ${PORT}`));
