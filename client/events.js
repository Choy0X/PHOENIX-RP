onNet('MRCore:Notify', (text, type, duration) => {
    MRCore.Functions.Notify(text, type, duration);
});

onNet('MRCore:Notify:Simple', (text, color, flash, saveToBrief) => {
    MRCore.Functions.SimpleNotify(text, color, flash, saveToBrief);
})

onNet('MRCore:Notify:Advanced', (message, color, sender, subject, textureDict, iconType, flash, saveToBrief) => {
    MRCore.Functions.AdvancedNotify(message, color, sender, subject, textureDict, iconType, flash, saveToBrief);
});

onNet('MRCore:Client:TriggerCallback', (name, ...args) => {
    if (!MRCore.ServerCallbacks[name]) return;
    MRCore.ServerCallbacks[name](...args);
    delete MRCore.ServerCallbacks[name];
});

onNet('MRCore:client:STCResponse', async (callbackName, cbId, ...args) => {
    if (!MRCore.STCCallbacks[callbackName]) return;
    try {
        const result = await MRCore.STCCallbacks[callbackName](...args);
        emitNet('MRCore:server:STCResponse', cbId, result);
    } catch (error) {
        emitNet('MRCore:server:STCResponse', cbId, null);
    }
});

onNet('MRCore:Debug', (DebugKey, DebugValue) => {
    console.log(DebugKey, JSON.stringify(DebugValue));
});

onNet('MRCore:Command:GoToMarker', async () => {
    const perm = GlobalState.CommandsList['tpm']['permission'];
    const HasPerm = MRCore.Functions.HasPermission(perm);
    if (!HasPerm) return MRCore.Functions.Notify('You do not have permission to use this command.', 'error', 2500);
    const Teleported = await MRCore.Functions.GoToMarker();
    if (Teleported[0]) {
        return MRCore.Functions.Notify(Teleported[1], 'success', 2500);
    } else {
        return MRCore.Functions.Notify(Teleported[1], 'error', 2500);
    }
});

onNet('MRCore:Command:SpawnVehicle', async (model) => {
    const perm = GlobalState.CommandsList['car']['permission'];
    const HasPerm = MRCore.Functions.HasPermission(perm);
    if (!HasPerm) return MRCore.Functions.Notify('You do not have permission to spawn vehicles.', 'error', 2500);
    const Vehicle = await MRCore.Functions.SpawnVehicle(model, null, true);
    if (!Vehicle) return MRCore.Functions.Notify(`We could not spawn the following vehicle model: ${model}.`, 'error', 2500);
    TaskWarpPedIntoVehicle(PlayerPedId(), Vehicle, -1);
});

onNet('MRCore:Command:TeleportToCoords', (coords) => {
    const permTPC = GlobalState.CommandsList['tpc']['permission'];
    const permTP = GlobalState.CommandsList['tp']['permission'];
    const HasPerm = MRCore.Functions.HasPermission(permTPC) || MRCore.Functions.HasPermission(permTP);
    if (!HasPerm) return MRCore.Functions.Notify('You do not have permission to teleport.', 'error', 2500);
    const Ped = PlayerPedId();
    if (IsPedInAnyVehicle(Ped, false)) {
        const Vehicle = GetVehiclePedIsIn(Ped, false);
        SetEntityCoords(Vehicle, coords[0], coords[1], coords[2], false, false, false, false);
    } else {
        SetEntityCoords(Ped, coords[0], coords[1], coords[2], false, false, false, false);
    }
});

onNet('MRCore:Client:OutOfCharacter', (playerID, playerName, playerMessage) => {
    emit('chatMessage', `OOC (Global) ${MRCore.Functions.capitalizeFirstLetter(playerName)}[${playerID}]`, 'normal', playerMessage);
});

onNet('MRCore:Client:OnJobUpdate', (job = {}) => {
    emit('chat:addMessage', { template: '<div class="chat-message" style="background-color: rgba(35, 191, 4, 0.75); box-shadow: rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px inset;"><b>Attention</b>: You have been assigned a new job as a ({0}). Your grade for this job is ({1}). Please report for duty if you are currently off duty</div>', args: [job.label, job.grade.name] });
})

onNet('MRCore:Client:LocalOutOfCharacter', (playerID, playerName, playerMessage) => {
    const ServerPlayer = GetPlayerFromServerId(playerID);
    if (ServerPlayer === -1) return;
    const SenderPed = GetPlayerPed(ServerPlayer);
    const SenderCoords = GetEntityCoords(SenderPed);
    const PlayerPed = PlayerPedId();
    const PlayerCoords = GetEntityCoords(PlayerPed);
    const Distance = GetDistanceBetweenCoords(SenderCoords[0], SenderCoords[1], SenderCoords[2], PlayerCoords[0], PlayerCoords[1], PlayerCoords[2], true);

    console.log('Received Local OOC message from server.', Distance)

    if (Distance <= 10) {
        emit('chatMessage', `OOC (Local) ${MRCore.Functions.capitalizeFirstLetter(playerName)}[${playerID}]`, 'normal', playerMessage);
    }
});