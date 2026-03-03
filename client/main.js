const LocalPlayerIndex = PlayerId();
const PlayerServerID = GetPlayerServerId(LocalPlayerIndex);

const MRCore = {
    PlayerIndex: LocalPlayerIndex,
    ServerID: PlayerServerID,
    Functions: {},
    Shared: MRShared,
    ServerCallbacks: {},
    STCCallbacks: {},
    CTSCallBacks: {},
    PlayerData: {}
}

const GetCoreObject = () => MRCore;

exports('GetCoreObject', GetCoreObject);