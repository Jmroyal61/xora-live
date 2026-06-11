[10:15 AM, 11/6/2026] Jmroyal61 🌹✨🐎🕊️: // Jab koi client/user server se connect hota hai
io.on("connection", (socket) => {
    console.log(User connected: ${socket.id});

    // 1. Ek custom event banana (Message receive karne ke liye)
    socket.on("send_message", (data) => {
        console.log("Message received:", data);
        
        // 2. Wahi message baki sabhi connected users ko bhej dena
        io.emit("receive_message", data);
    });

    // Jab koi user tab band kar deta hai ya disconnect hota hai
    socket.on("disconnect", () => {
        console.log(User disconnected: ${socket.id});
    });
});
[10:22 AM, 11/6/2026] Jmroyal61 🌹✨🐎🕊️: const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Boys aur Girls ki waiting lists (queues)
let boysQueue = [];
let girlsQueue = [];

// Active rooms aur users ka track rakhne ke liye
let activeMatches = {}; 

app.get("/", (req, res) => {
  res.send("Xora Live Matching Server is Running...");
});

// Socket.IO Logic
io.on("connection", (socket) => {
  console.log(New user connected: ${socket.id});

  // 1. Jab user apni details (Gender) ke sath match start karega
  socket.on("start_match", (data) => {
    const { gender, name } = data; // gender 'boy' ya 'gi…
[10:29 AM, 11/6/2026] Jmroyal61 🌹✨🐎🕊️: <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xora Live - Video Matching Test</title>
    <script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; background: #121212; color: white; padding: 20px; }
        .setup-box { background: #1e1e1e; padding: 20px; border-radius: 10px; display: inline-block; margin-top: 50px; }
        select, input, button { padding: 10px; margin: 10px; font-size: 16px; border-radius: 5px; border: none; }
        button { background: #ff4757; color: white; cursor: pointer; font-weight: bold; }
        button:hover { background: #ff6b81; }
…
[1:30 PM, 11/6/2026] Jmroyal61 🌹✨🐎🕊️: <script>
    const socket = io("https://xora-live-production.up.railway.app");
    let localStream;
    let peerConnection;
    const config = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

    // 1. Camera access lena
    async function startMatchingProcess() {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        document.getElementById("localVideo").srcObject = localStream;
        
        const gender = document.getElementById("gender").value;
        socket.emit("start_match", { gender: gender });
    }

    // 2. Server se match milne par
    socket.on("match_found", async (data) => {
        peerConnection = new RTCPeerConnection(config);
        
        // Apna video track add karna
   …
[1:41 PM, 11/6/2026] Jmroyal61 🌹✨🐎🕊️: const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, { cors: { origin: "*" } });

let boysQueue = [];
let girlsQueue = [];

io.on("connection", (socket) => {
    socket.on("start_match", (gender) => {
        if (gender === "boy") {
            if (girlsQueue.length > 0) {
                let partner = girlsQueue.shift();
                match(socket, partner);
            } else {
                boysQueue.push(socket);
            }
        } else {
            if (boysQueue.length > 0) {
                let partner = boysQueue.shift();
                match(partner, socket);
            } else {
                girlsQueue.push(socket);
            }
        }
    }…
[1:50 PM, 11/6/2026] Jmroyal61 🌹✨🐎🕊️: const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, { cors: { origin: "*" } });

let boysQueue = [];
let girlsQueue = [];

io.on("connection", (socket) => {
    socket.on("start_match", (gender) => {
        if (gender === "boy") {
            if (girlsQueue.length > 0) {
                let partner = girlsQueue.shift();
                match(socket, partner);
            } else {
                boysQueue.push(socket);
            }
        } else {
            if (boysQueue.length > 0) {
                let partner = boysQueue.shift();
                match(partner, socket);
            } else {
                girlsQueue.push(socket);
            }
        }
    });

    socket.on("signal", (data) => {
        io.to(data.to).emit("signal", { from: socket.id, signal: data.signal });
    });

    socket.on("disconnect", () => {
        boysQueue = boysQueue.filter(s => s !== socket);
        girlsQueue = girlsQueue.filter(s => s !== socket);
    });
});

function match(boy, girl) {
    boy.emit("matched", { partnerId: girl.id, initiator: true });
    girl.emit("matched", { partnerId: boy.id, initiator: false });
}

http.listen(3000, () => console.log("Server Running"));[10:15 AM, 11/6/2026] Jmroyal61 🌹✨🐎🕊️: // Jab koi client/user server se connect hota hai
io.on("connection", (socket) => {
    console.log(User connected: ${socket.id});

    // 1. Ek custom event banana (Message receive karne ke liye)
    socket.on("send_message", (data) => {
        console.log("Message received:", data);
        
        // 2. Wahi message baki sabhi connected users ko bhej dena
        io.emit("receive_message", data);
    });

    // Jab koi user tab band kar deta hai ya disconnect hota hai
    socket.on("disconnect", () => {
        console.log(User disconnected: ${socket.id});
    });
});
[10:22 AM, 11/6/2026] Jmroyal61 🌹✨🐎🕊️: const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Boys aur Girls ki waiting lists (queues)
let boysQueue = [];
let girlsQueue = [];

// Active rooms aur users ka track rakhne ke liye
let activeMatches = {}; 

app.get("/", (req, res) => {
  res.send("Xora Live Matching Server is Running...");
});

// Socket.IO Logic
io.on("connection", (socket) => {
  console.log(New user connected: ${socket.id});

  // 1. Jab user apni details (Gender) ke sath match start karega
  socket.on("start_match", (data) => {
    const { gender, name } = data; // gender 'boy' ya 'gi…
[10:29 AM, 11/6/2026] Jmroyal61 🌹✨🐎🕊️: <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xora Live - Video Matching Test</title>
    <script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; background: #121212; color: white; padding: 20px; }
        .setup-box { background: #1e1e1e; padding: 20px; border-radius: 10px; display: inline-block; margin-top: 50px; }
        select, input, button { padding: 10px; margin: 10px; font-size: 16px; border-radius: 5px; border: none; }
        button { background: #ff4757; color: white; cursor: pointer; font-weight: bold; }
        button:hover { background: #ff6b81; }
…
[1:30 PM, 11/6/2026] Jmroyal61 🌹✨🐎🕊️: <script>
    const socket = io("https://xora-live-production.up.railway.app");
    let localStream;
    let peerConnection;
    const config = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

    // 1. Camera access lena
    async function startMatchingProcess() {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        document.getElementById("localVideo").srcObject = localStream;
        
        const gender = document.getElementById("gender").value;
        socket.emit("start_match", { gender: gender });
    }

    // 2. Server se match milne par
    socket.on("match_found", async (data) => {
        peerConnection = new RTCPeerConnection(config);
        
        // Apna video track add karna
   …
[1:41 PM, 11/6/2026] Jmroyal61 🌹✨🐎🕊️: const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, { cors: { origin: "*" } });

let boysQueue = [];
let girlsQueue = [];

io.on("connection", (socket) => {
    socket.on("start_match", (gender) => {
        if (gender === "boy") {
            if (girlsQueue.length > 0) {
                let partner = girlsQueue.shift();
                match(socket, partner);
            } else {
                boysQueue.push(socket);
            }
        } else {
            if (boysQueue.length > 0) {
                let partner = boysQueue.shift();
                match(partner, socket);
            } else {
                girlsQueue.push(socket);
            }
        }
    }…
[1:50 PM, 11/6/2026] Jmroyal61 🌹✨🐎🕊️: const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, { cors: { origin: "*" } });

let boysQueue = [];
let girlsQueue = [];

io.on("connection", (socket) => {
    socket.on("start_match", (gender) => {
        if (gender === "boy") {
            if (girlsQueue.length > 0) {
                let partner = girlsQueue.shift();
                match(socket, partner);
            } else {
                boysQueue.push(socket);
            }
        } else {
            if (boysQueue.length > 0) {
                let partner = boysQueue.shift();
                match(partner, socket);
            } else {
                girlsQueue.push(socket);
            }
        }
    });

    socket.on("signal", (data) => {
        io.to(data.to).emit("signal", { from: socket.id, signal: data.signal });
    });

    socket.on("disconnect", () => {
        boysQueue = boysQueue.filter(s => s !== socket);
        girlsQueue = girlsQueue.filter(s => s !== socket);
    });
});

function match(boy, girl) {
    boy.emit("matched", { partnerId: girl.id, initiator: true });
    girl.emit("matched", { partnerId: boy.id, initiator: false });
}

http.listen(3000, () => console.log("Server Running"));
