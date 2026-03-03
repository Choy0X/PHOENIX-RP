let isWaitingForResponse = false;
let TokenFetchPromise = null;
let currentToken = null;

const RequestSCToken = async () => {
    if (currentToken !== null) return currentToken;
    return new Promise(resolve => {
        TokenFetchPromise = resolve;
        emitNet('MRCore:Server:RequestRSPToken');
    });
}

onNet('MRCore:Client:RSP:ID', (token) => {
    if (TokenFetchPromise) {
        currentToken = token;
        TokenFetchPromise(token);
        TokenFetchPromise = null;
    }
});

MRCore.Functions.TriggerServerCallback = async (name, ...args) => {
    if (isWaitingForResponse) {
        console.log('Waiting for the previous request to finish...');
    }

    // Wait for any pending request to complete
    while (isWaitingForResponse) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    isWaitingForResponse = true;

    const RequestID = `CB-${PlayerServerID}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    try {
        const Token = await RequestSCToken();

        if (!Token || typeof Token !== 'string' || Token.length < 5) return null;

        return new Promise((resolve) => {
            MRCore.CTSCallBacks[RequestID] = response => {
                isWaitingForResponse = false;
                resolve(response);
            };

            emitNet('MRCore:Server:handleClientRequest', name, RequestID, Token, ...args);

            // Timeout for the request
            setTimeout(() => {
                if (MRCore.CTSCallBacks[RequestID]) {
                    isWaitingForResponse = false;
                    delete MRCore.CTSCallBacks[RequestID];
                    resolve('Request Timed Out');
                }
            }, 10000); // 10 seconds timeout
        });
    } catch (error) {
        isWaitingForResponse = false;
        currentToken = null;
        console.error('Error in TriggerServerCallback:', error);
        return 'Error occurred during the request';
    }
};

onNet('MRCore:Client:RSP', (requestID, response, SCT = '') => {
    currentToken = SCT;
    if (!MRCore.CTSCallBacks[requestID]) return;
    MRCore.CTSCallBacks[requestID](response);
    delete MRCore.CTSCallBacks[requestID];
});