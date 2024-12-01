let currentPIDGains = {
    roll: { P: 0, I: 0, D: 0 },
    pitch: { P: 0, I: 0, D: 0 },
    yaw: { P: 0, I: 0, D: 0 },
};

const getChangedParams = (newPIDGains) => {
    const changedParams =[];

    for (const [axis, gains] of Object.entries(newPidGains)) {
        for (const [gainType, newValue] of Object.entries(gains)) {
            const currentValue = currentPidGains[axis][gainType];
            if (newValue !== currentValue) {
                changedParams.push({ paramName: `${axis}_${gainType}`, value: newValue });
            }
        }
    }

    return changedParams;
};

const updateCache = (newPIDGains) => {
    currentPIDGains = JSON.parse(JSON.stringify(newPIDGains));
};

const sendPIDGainsSequentially = async(changedParams, SerialPort, socket) => {
    for(const param of changedParams){
        try{
            await SendParamSet(SerialPort, param.paramName, param.value);
            socket.emit('ParamUpdateSuccess', param);
            console.log("Updated ${param.paramName} to ${param.value}");
        }
        catch(error){
            socket.emit('ParamUpdateFailure', { paramName: param.paramName, error });
            console.error("Failed to update ${param.parmName}:", error);
        }
    }
}

module.exports = {
    getChangedParams,
    updateCache,
    sendPIDGainsSequentially
};
