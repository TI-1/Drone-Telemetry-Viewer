const {getChangedParams, updateCache, sendPIDGainsSequentially} = require("../controllers/pidController");


const handlePIDGains = async(newPIDGains, socket, serialPort) => {
    console.log("Recieved PID Gains from client:", newPIDGains);

    if(!serialPort){
        console.error("Serial port not initialised.");
        return;
    }

    const changedParams = getChangedParams(newPIDGains);
    console.log("Changed Parameters:", changedParams);

    if (changedParams.length > 0){
        await sendPIDGainsSequentially(changedParams, serialPort, socket);
        updateCache(newPIDGains);
    }
    else{
        console.log("No parameters have changed.");
        socket.emit('NoParamsChanged');
    }
};

module.exports = {handlePIDGains}