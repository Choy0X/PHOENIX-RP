console.log('Init Client To Server Callbacks');

onNet('MRCore:Server:RequestRSPToken', () => {
    const source = global.source;
    console.log('Received Token Request for Source:', source);
    if (!MRCore.CTSTokens[source]) MRCore.CTSTokens[source] = uuidv4();
    return emitNet('MRCore:Client:RSP:ID', source, MRCore.CTSTokens[source]);
})

onNet('MRCore:Server:handleClientRequest', async (eventName, requestID, token, ...args) => {
    const source = global.source;

    if (!MRCore.CTSTokens[source] || MRCore.CTSTokens[source] !== token) {
        console.log('Token Mismatch for Source:', source, 'Token:', token, 'Expected:', MRCore.CTSTokens[source]);
        MRCore.Player.CheatDetected(source, 'Tried to Trigger Client To Server CallBack with an invalid request ID');
        return emitNet('MRCore:Client:RSP', source, requestID, null);
    }

    if (!MRCore.CTSCallBacks[eventName]) return emitNet('MRCore:Client:RSP', source, requestID, null, MRCore.CTSTokens[source]);

    MRCore.CTSTokens[source] = uuidv4();

    try {
        const response = await MRCore.CTSCallBacks[eventName](source, ...args);
        emitNet('MRCore:Client:RSP', source, requestID, response, MRCore.CTSTokens[source]);
    } catch (error) {
        emitNet('MRCore:Client:RSP', source, requestID, null, MRCore.CTSTokens[source]);
    }
});

MRCore.Functions.RegisterServerCallBack = (name, callback) => MRCore.CTSCallBacks[name] = callback;

//Usage Example

/*MRCore.Functions.RegisterServerCallBack('MRCore:Server:GetPlayerData', (source, index = 0) => {
    console.log('Player Data Requested for Source:', source, 'Index:', index);
    return ['Response For Player: ' + source + ' Index: ' + index, index]
});

MRCore.Functions.RegisterServerCallBack('MRCore:Server:TestArgs', (source, newSession, newPort) => {
    console.log('Test Args Requested for Source:', source, 'New Session:', newSession, 'New Port:', newPort);
    return 'Response For Test Args';
});

MRCore.Functions.RegisterServerCallBack('MRCore:Server:UpdatePlayerToken', (source, token) => {
    console.log('Token Updated for Source:', source, 'Token:', token);
    //MRCore.CTSTokens[source] = token;
    return 'Token Updated';
});*/