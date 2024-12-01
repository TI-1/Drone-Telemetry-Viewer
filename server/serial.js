const { SerialPort } = require('serialport');
const { MavLinkPacketSplitter, MavLinkPacketParser, minimal, common, 
    ardupilotmega , send}  = require('node-mavlink');
const {createParamSetMessage} = require('./utils/MavlinkUtils');



let pendingParam = null;
const graphData = [];

const REGISTRY = {
    ...minimal.REGISTRY,
    ...common.REGISTRY,
    ...ardupilotmega.REGISTRY,
  }

// Function to find the appropriate drone port
async function findDronePort(portname) {
    const ports = await SerialPort.list();
    console.log(ports);
    const dronePort = ports.find(port => port.manufacturer && port.manufacturer.includes(portname));

    if (dronePort) {
        console.log(`${portname} port found:`, dronePort);
        return dronePort;
    } else {
        console.log(new Error(`Error listing ports: ${portname} port not found`));
        return null;
    }
}

// Function to initialize the serial port
async function initialiseSerialPort() {
    return new Promise((resolve, reject) => {
        findDronePort('FTDI').then(dronePort => {
            if (dronePort != null) {
                const SerialPortInstance = new SerialPort({ path: dronePort.path, baudRate: 115200});

                SerialPortInstance.on('open', () => {
                    console.log(`Connected to Arduino Uno on port ${dronePort.path}`);
                    resolve(SerialPortInstance);
                });

                SerialPortInstance.on('error', err => {
                    console.error('Error:', err.message);
                    reject(err);
                });

                SerialPortInstance.on('close', () => {
                    console.log('Serial port closed');
                });
            } else {
                reject('Cannot initialise serial Port');
            }
        }).catch(reject);
    });
}


function RecieveSerialDataMav(SerialPortInstance, socket){
    console.log("recieving mavlink data");      
    const reader = SerialPortInstance.pipe(new MavLinkPacketSplitter()).pipe(new MavLinkPacketParser())
    console.log("ParserReady");
    reader.on('data', (packet) => {
        handleMavlinkMessage(packet,socket)
        });
}

const SendParamSet = async (port, paramName, value, callback) => {
    const targetSystem = 1;
    const targetComponent = 1;
    const paramType = 9;

    const paramSetMessage = createParamSetMessage(targetSystem, targetComponent,paramName, value, paramType);

    try{
        await send(port, paramSetMessage);
        console.log("Sent PARAM_SET for ${paramName} with value ${value}");
        const timeout = setTimeout(() => {
            pendingParam = null;
            callback(false, "Timeout waiting for PARAM_VALUE.");
        },5000);

        pendingParam = {
            paramName,
            value,
            callback,
            timeout,
        };
    } catch(err){
        callback(false, "Failed to send PARAM_SET message.");
        console.error("Error sending PARAM_SET message: ${err}");
    }
};

function handleParamValueResponse(data, socket){
    if(pendingParam){
        clearTimeout(pendingParam.timeout);

        const { paramName, value, callback } = pendingParam;
        pendingParam = null;
        
        if(data.paramID == paramName && data.paramValue == value){
            callback(true);
        }
        else{
            callback(false, 'Value mismatch or write failed');
        }
    }
    socket.emit("ParamValue",{
        paramName: data.paramID,
        value: data.paramValue,
    });
}

function handleMavlinkMessage(packet, socket){
    const clazz = REGISTRY[packet.header.msgid]
    const data = packet.protocol.data(packet.payload, clazz)
    console.log(packet.header.msgid)
    switch(packet.header.msgid){
        case 30:
            const attitude = {
                Roll: data.roll * 180/Math.PI,
                Pitch: data.pitch * 180/Math.PI,
                Yaw: data.yaw * 180/Math.PI,
                Rollspeed: data.rollspeed * 180/Math.PI,
                Pitchspeed: data.pitchspeed * 180/Math.PI,
                Yawspeed: data.yawspeed * 180/Math.PI,
                Time:Math.trunc(data.timeBootMs / 1000)
            }
            console.log(attitude)
            if(graphData.length > 10){
                graphData.shift();
            }
            graphData.push(attitude);
            socket.emit("imuData", graphData);
            break;

        case 0:
            // Need to figure out what I want to do with HeartBeat Data
            console.log(data)

        case 22:
            handleParamValueResponse(data, socket);
    }
}

module.exports = {initialiseSerialPort, findDronePort, RecieveSerialDataMav, SendParamSet}