const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

let boysQueue = [];
let girlsQueue = [];

app.get("/", (req, res) => {
    res.send("Xora Live Backend is Running perfectly!");
});

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("start_match", (gender) => {
        console.log(`Match request received for gender: ${gender}`);
        if (gender === "boy") {
            if (girlsQueue.length > 0) {
                let partner = girlsQueue.shift();
                match(socket, partner);
            } else {
                if (!boysQueue.includes(socket)) boysQueue.push(socket);
                socket.emit("waiting", "Looking for a girl...");
            }
        } else if (gender === "girl") {
            if (boysQueue.length > 0) {
                let partner = boysQueue.shift();
                match(partner, socket);
            } else {
                if (!girlsQueue.includes(socket)) girlsQueue.push(socket);
                socket.emit("waiting", "Looking for a boy...");
            }
        }
    });

    socket.on("signal", (data) => {
        io.to(data.to).emit("signal", { from: socket.id, signal: data.signal });
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        boysQueue = boysQueue.filter(s => s.id !== socket.id);
        girlsQueue = girlsQueue.filter(s => s.id !== socket.id);
    });
});

function match(boy, girl) {
    console.log(`Match Found: ${boy.id} (Boy) ❤️ ${girl.id} (Girl)`);
    boy.emit("matched", { partnerId: girl.id, initiator: true });
    girl.emit("matched", { partnerId: boy.id, initiator: false });
}

http.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});
