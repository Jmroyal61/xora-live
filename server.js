const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname, '/')));

// Global active socket cache registry
let activeUsers = []; 

io.on('connection', (socket) => {
    console.log('New Socket Session Connected:', socket.id);

    socket.on('register', (data) => {
        socket.gender = data.gender || "Boy";
        socket.preference = data.preference || "Random"; 
        socket.isVIP = data.isVIP || false;
        socket.isMatched = false;

        // Ensure session redundancy removal
        activeUsers = activeUsers.filter(user => user.id !== socket.id);
        activeUsers.push(socket);

        console.log(`Active Node - Registered: ${socket.id} | Gender: ${socket.gender} | Pref: ${socket.preference} | VIP: ${socket.isVIP}`);
        
        // Execute real-time algorithmic matching
        executeMatchmaking(socket);
    });

    socket.on('signal', (data) => {
        io.to(data.to).emit('signal', { from: socket.id, signal: data.signal });
    });

    socket.on('disconnect', () => {
        console.log('Session Destructed:', socket.id);
        activeUsers = activeUsers.filter(user => user.id !== socket.id);
    });
});

function executeMatchmaking(socket) {
    if (socket.isMatched) return;

    for (let partner of activeUsers) {
        if (partner.id !== socket.id && !partner.isMatched) {
            
            let sourceClientHappy = false;
            let targetedPartnerHappy = false;

            // Evaluating core structural logic parameters
            if (socket.preference === "Random") {
                sourceClientHappy = true; 
            } else if (socket.preference === "Only Girl" && partner.gender === "Girl") {
                sourceClientHappy = true; 
            } else if (socket.preference === "Only Boy" && partner.gender === "Boy") {
                sourceClientHappy = true; 
            }

            if (partner.preference === "Random") {
                targetedPartnerHappy = true; 
            } else if (partner.preference === "Only Girl" && socket.gender === "Girl") {
                targetedPartnerHappy = true; 
            } else if (partner.preference === "Only Boy" && socket.gender === "Boy") {
                targetedPartnerHappy = true; 
            }

            // Cross-Validation for matching
            if (sourceClientHappy && targetedPartnerHappy) {
                socket.isMatched = true;
                partner.isMatched = true;

                // Emitting direct transport commands
                socket.emit('matched', { partnerId: partner.id, createOffer: true, partnerGender: partner.gender });
                partner.emit('matched', { partnerId: socket.id, createOffer: false, partnerGender: socket.gender });

                // Segregate active elements from global pool immediately
                activeUsers = activeUsers.filter(user => user.id !== socket.id && user.id !== partner.id);
                
                console.log(`Matching Matrix Established: ${socket.id} <=> ${partner.id}`);
                break;
            }
        }
    }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Production Matching Stack Active on Local Node :${PORT}`));
