const {SerialPort, DelimiterParser} = require('serialport');

async function findDronePort(portname){
    const ports = await SerialPort.list();
    console.log(ports)
    dronePort = ports.find(port => port.manufacturer && port.manufacturer.includes(portname));

    if(dronePort){
        console.log(`${portname} port found:`, dronePort);
        return dronePort;
    }
    else{
        console.log(new Error(`Error listing ports: ${portname} port not found`))
        return null;
    }
}

async function initialiseSerialPort() {
    return new Promise((resolve, reject) => {
        findDronePort('Arduino').then(dronePort => {
            if (dronePort != null) {
                const SerialPortInstance = new SerialPort({ path: dronePort.path, baudRate: 9600 });

                SerialPortInstance.on('open', () => {
                    console.log(`Connected to Arduino Uno on port ${dronePort.path}`);
                    resolve(SerialPortInstance); // Resolve the promise with SerialPortInstance
                });

                SerialPortInstance.on('error', err => {
                    console.error('Error:', err.message);
                    reject(err); // Reject the promise on error
                });

                SerialPortInstance.on('close', () => {
                    console.log('Serial port closed');
                    // Perform any cleanup or handle closure
                });
            } else {
                reject('Cannot initialise serial Port'); // Reject the promise if dronePort is null
            }
        }).catch(reject); // Catch any errors from findDronePort
    });
}

function ParseSerialData(data){
    ParseFloatArray(data);
}

function ParseFloatArray(str){
    floatArray = str.split(',').map(parseFloat);
    console.log(floatArray);
    return floatArray
}

function SendData(data,socket){
    const floatData = ParseFloatArray(data);
    const packet = [{name: floatData[3], Gyro_x: floatData[0]*100, Gyro_y: floatData[1]*100, Gyro_z: floatData[2]*100 }]
    socket.emit("message",packet )     
}
function RecieveSerialData(SerialPortInstance,socket){
    const byteParser = SerialPortInstance.pipe(new DelimiterParser({delimiter:'*', includeDelimiter:false}));
    const graphData = []
    byteParser.on('data', (data) => {
                console.log('Data received:', data);
    const floatData = ParseFloatArray(data.toString());
    if(graphData.length > 50){
        graphData.shift();
    }
    graphData.push({name: floatData[3], Gyro_x: floatData[0], Gyro_y: floatData[1], Gyro_z: floatData[2]});
    socket.emit("message",graphData);  
    });
}

module.exports = {initialiseSerialPort, findDronePort,RecieveSerialData}