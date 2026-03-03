const axios = require('axios');
const rethinkdb = require('rethinkdb');
const { v4: uuidv4 } = require('uuid');
const cron = require('node-cron');

MRCore = {
    Guild: { Roles: {}, Members: {} },
    Config: MRConfig,
    Shared: MRShared,
    ServerCallbacks: {},
    STCCallbacks: {},
    CTSCallBacks: {},
    CTSTokens: {},
    STCTimeouts: {},
    UseableItems: {},
    Players: {},
    Player: {},
    ConnectedPlayers: {},
};

const GetCoreObject = () => MRCore;

exports('GetCoreObject', GetCoreObject);

console.log('Init MRCore Server')