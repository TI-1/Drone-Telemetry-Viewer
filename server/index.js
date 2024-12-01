const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const port = 4000;
const serial = require("./serial.js");
const socketService = require("./services/socketService")

const app = express()
const httpServer = http.createServer(app)

const server = new socketio.Server(httpServer,{
    cors:{
        origin: '*',
    },
});

let serialPort;

//Initialize serial communication
serial.initialiseSerialPort().then((sp) => {
    serialPort = sp;
    console.log("Serial port initialised.");
}).catch((error) => {
    console.error("Failed to initialise serial port: ", error);

    httpServer.close(() => {
        console.log("Server stopped due to serial port initialization failure.");
    });
    process.exit(1);  // Exit the process with an error code
});

//Handle new client connections

server.on("connection", (socket)=>{
    console.log("connected");  

    socket.on("PidGains", async (newpidGains) => {
       await socketService.handlePIDGains(newpidGains, socket, serialPort);
    })
   serial.RecieveSerialDataMav(serialPort, socket);
   
})

httpServer.listen(port,() => {
    console.log(`Socket.IO server is running on port ${port}`);
});