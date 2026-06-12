const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname, '/')));

// Active users ki single master list
let activeUsers = []; 

io.on('connection', (socket) => {
    console.log('User Connected:', socket.id);

    socket.on('register', (data) => {
        socket.gender = data.gender;
        socket.preference = data.preference; 
        socket.isVIP = data.isVIP;
        socket.isMatched = false;

        // Puraani entry clean karke naye sire se add karna
        activeUsers = activeUsers.filter(u => u.id !== socket.id);
        activeUsers.push(socket);

        console.log(`Registered: ${socket.id} | Gender: ${socket.gender} | Wants: ${socket.preference} | VIP: ${socket.isVIP}`);
        
        // Match dhoondhne ki koshish karein
        findMatch(socket);
    });

    socket.on('signal', (data) => {
        io.to(data.to).emit('signal', { from: socket.id, signal: data.signal });
    });

    socket.on('disconnect', () => {
        activeUsers = activeUsers.filter(u => u.id !== socket.id);
    });
});

function findMatch(socket) {
    if (socket.isMatched) return;

    for (let partner of activeUsers) {
        // Khud ko chhod kar aur jo pehle se busy nahi hai usse check karein
        if (partner.id !== socket.id && !partner.isMatched) {
            
            let socketIsHappy = false;
            let partnerIsHappy = false;

            // 1. Check karein kya "Socket" ko apna pasandida partner mil raha hai?
            if (socket.preference === "Random") {
                socketIsHappy = true; // Free user kisi se bhi match ho sakta hai
            } else if (socket.preference === "Only Girl" && partner.gender === "Girl") {
                socketIsHappy = true; // VIP ko ladki chahiye thi aur saamne ladki hai
            } else if (socket.preference === "Only Boy" && partner.gender === "Boy") {
                socketIsHappy = true; // VIP ko ladka chahiye tha aur saamne ladka hai
            }

            // 2. Check karein kya "Partner" bhi is match se khush hai?
            if (partner.preference === "Random") {
                partnerIsHappy = true; // Agar saamne wala free hai toh wo kisi se bhi jud jayega
            } else if (partner.preference === "Only Girl" && socket.gender === "Girl") {
                partnerIsHappy = true; 
            } else if (partner.preference === "Only Boy" && socket.gender === "Boy") {
                partnerIsHappy = true;
            }

            // 3. Agar DONO ki shartein poori hoti hain (Chahe ek VIP ho aur ek Free)
            if (socketIsHappy && partnerIsHappy) {
                socket.isMatched = true;
                partner.isMatched = true;

                // Dono ko connect hone ka signal bhejein
                socket.emit('matched', { partnerId: partner.id, createOffer: true, partnerGender: partner.gender });
                partner.emit('matched', { partnerId: socket.id, createOffer: false, partnerGender: socket.gender });

                // Dono ko list se bahar karein taaki call ke beech koi teesra na aaye
                activeUsers = activeUsers.filter(u => u.id !== socket.id && u.id !== partner.id);
                
                console.log(`Successfully Matched VIP/Free: ${socket.id} with ${partner.id}`);
                break;
            }
        }
    }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Smart VIP Matching Engine Active on Port ${PORT}`));
