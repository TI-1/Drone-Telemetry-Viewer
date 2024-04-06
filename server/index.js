const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const port = 4000;
const serial = require("./serial.js");

const app = express()
const httpServer = http.createServer(app)

const server = new socketio.Server(httpServer,{
    cors:{
        origin: '*',
    }
})

server.on("connection", (socket)=>{
    console.log("connected")    
    serial.initialiseSerialPort().then((sp) => serial.RecieveSerialData(sp,socket)).catch(error => console.log(error));
   
})





httpServer.listen(port,() => {
    console.log(`Socket.IO server is running on port ${port}`);
});