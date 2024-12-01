const { ParamSet } = require('node-mavlink/dist/lib/common');


const createParamSetMessage = (targetSystem, targetComponent, paramName, value, paramType) => {
    const paramSetMessage = new ParamSet();
    paramSetMessage.paramId = paramName;
    paramSetMessage.paramValue = value;
    paramSetMessage.targetSystem = targetSystem;
    paramSetMessage.targetComponent = targetComponent;
    paramSetMessage.paramType = paramType;
    return paramSetMessage;
};

module.exports = (createParamSetMessage)