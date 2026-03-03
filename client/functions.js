MRCore.Functions.sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

//MRCore.Functions.GetPlayerData = () => LocalPlayer.state.PlayerData;

MRCore.Functions.GetPlayerData = () => MRCore.PlayerData;

MRCore.Functions.HasPermission = (permission = 'user') => {
    const PlayerData = MRCore.Functions.GetPlayerData();
    return PlayerData && ((PlayerData.permission === permission) || (PlayerData.permission === 'root'));
}

MRCore.Functions.HasItem = (spawn_name) => {
    return false;
}

MRCore.Functions.DrawText = function (x, y, width, height, scale, r, g, b, a, text) {
    SetTextFont(4);
    SetTextProportional(0);
    SetTextScale(scale, scale);
    SetTextColour(r, g, b, a);
    SetTextDropshadow(0, 0, 0, 0, 255);
    SetTextEdge(1, 0, 0, 0, 255);
    SetTextDropShadow();
    SetTextOutline();
    SetTextEntry("STRING");
    AddTextComponentString(text);
    DrawText(x - width / 2, y - height / 2 + 0.005);
}

MRCore.Functions.DrawText3D = function (x, y, z, text, lines) {
    const NumLines = lines || 1;
    SetTextScale(0.35, 0.35)
    SetTextFont(4)
    SetTextProportional(1)
    SetTextColour(255, 255, 255, 215)
    SetTextEntry("STRING")
    SetTextCentre(true)
    AddTextComponentString(text)
    SetDrawOrigin(x, y, z, 0)
    DrawText(0.0, 0.0)
    const factor = (text.length) / (370 * NumLines)
    DrawRect(0.0, 0.0 + 0.0125, 0.017 + factor, 0.03, 0, 0, 0, 75)
    ClearDrawOrigin()
}

MRCore.Functions.DrawText3Ds = function (x, y, z, text) {
    SetTextScale(0.35, 0.35)
    SetTextFont(4)
    SetTextProportional(1)
    SetTextColour(255, 255, 255, 215)
    SetTextEntry("STRING")
    SetTextCentre(true)
    AddTextComponentString(text)
    SetDrawOrigin(x, y, z, 0)
    DrawText(0.0, 0.0)
    const factor = (text.length) / 370
    DrawRect(0.0, 0.0 + 0.0125, 0.017 + factor, 0.03, 0, 0, 0, 75)
    ClearDrawOrigin()
}

MRCore.Functions.Draw2DText = function (x, y, text, scale) {
    SetTextFont(4)
    SetTextProportional(7)
    SetTextScale(scale, scale)
    SetTextColour(255, 255, 255, 255)
    SetTextDropShadow(0, 0, 0, 0, 255)
    SetTextDropShadow()
    SetTextEdge(4, 0, 0, 0, 255)
    SetTextOutline()
    SetTextCentre(true)
    SetTextEntry("STRING")
    AddTextComponentString(text)
    DrawText(x, y)
}

MRCore.Functions.GetCoords = function (entity) {
    const coords = GetEntityCoords(entity, false)
    const heading = GetEntityHeading(entity)
    return {
        x: coords.x,
        y: coords.y,
        z: coords.z,
        a: heading
    }
}

MRCore.Functions.GetClosestVehicle = (radius = 10.0) => {
    const playerPed = PlayerPedId();
    const playerCoords = GetEntityCoords(playerPed, false);
    const FoundVehicle = {};

    const MainHandler = FindFirstVehicle();

    let handle = MainHandler[0];
    let vehicle = MainHandler[1];

    let success = true;

    while (success) {
        const vehicleCoords = GetEntityCoords(vehicle, false);
        const distance = Vdist(playerCoords[0], playerCoords[1], playerCoords[2], vehicleCoords[0], vehicleCoords[1], vehicleCoords[2]);

        if (distance <= radius) {
            FoundVehicle.vehicle = vehicle;
            FoundVehicle.distance = distance;
            FoundVehicle.coords = vehicleCoords;
            FoundVehicle.model = GetEntityModel(vehicle);
            FoundVehicle.plate = GetVehicleNumberPlateText(vehicle);
            FoundVehicle.name = GetDisplayNameFromVehicleModel(FoundVehicle.model);
            break;
        }

        const nextHandle = FindNextVehicle(handle);

        success = nextHandle[0];
        vehicle = nextHandle[1];
    }

    EndFindVehicle(handle);

    return Object.keys(FoundVehicle).length > 0 ? FoundVehicle : null;
};

MRCore.Functions.GetClosestVehicles = async (radius = 10.0) => {
    const playerPed = PlayerPedId();
    const playerCoords = GetEntityCoords(playerPed);
    const nearbyVehicles = [];

    const MainHandler = FindFirstVehicle();

    let handle = MainHandler[0];
    let vehicle = MainHandler[1];

    let success = true;

    while (success) {
        await MRCore.Functions.sleep(10);
        const coords = GetEntityCoords(vehicle);
        const distance = Vdist(playerCoords[0], playerCoords[1], playerCoords[2], coords[0], coords[1], coords[2]);
        const model = GetEntityModel(vehicle);
        const plate = GetVehicleNumberPlateText(vehicle);
        const vehicleName = GetDisplayNameFromVehicleModel(model);

        if (distance <= radius) {
            nearbyVehicles.push({
                vehicle,
                distance,
                coords,
                model,
                plate,
                vehicleName,
            });
        }

        const nextHandle = FindNextVehicle(handle);

        success = nextHandle[0];
        vehicle = nextHandle[1];
    }

    EndFindVehicle(handle);

    nearbyVehicles.sort((a, b) => a.distance - b.distance);

    return nearbyVehicles;
}

MRCore.Functions.GoToMarker = async function () {
    let entity = PlayerPedId();
    if (IsPedInAnyVehicle(entity, false)) {
        entity = GetVehiclePedIsUsing(entity);
    }
    let blip = GetFirstBlipInfoId(8);
    const BlipIDType = GetBlipInfoIdType(blip);
    let [cx, cy, cz] = GetBlipInfoIdCoord(blip);
    const EntityHeading = GetEntityHeading(entity);

    if (!blip || BlipIDType != 4) return [false, 'No marker found.'];

    RequestCollisionAtCoord(cx, cy, cz);

    for (let i = 0; i < 1000; i++) {
        SetEntityCoords(entity, cx, cy, i);
        SetEntityHeading(entity, EntityHeading);
        const [groundFound, groundZ] = GetGroundZFor_3dCoord(cx, cy, i + 0.0);
        if (groundFound) {
            SetEntityCoords(entity, cx, cy, groundZ, false, false, false, true);
            break;
        }
        await MRCore.Functions.sleep(10);
    }

    return [true, 'Teleported'];
}

MRCore.Functions.SpawnVehicle = async function (model, coords = null, IsNetworked = true) {
    const Ped = PlayerPedId();
    const Coords = coords || GetEntityCoords(Ped);
    const Heading = GetEntityHeading(Ped);
    const Model = (typeof model === 'number' ? model : GetHashKey(model));

    if (!Model || !IsModelInCdimage(Model) || !IsModelAVehicle(Model)) return false;

    RequestModel(Model);
    while (!HasModelLoaded(Model)) {
        console.log('Waiting for model to load...')
        await MRCore.Functions.sleep(10);
    }

    const Vehicle = CreateVehicle(Model, Coords[0], Coords[1], Coords[2], Heading, IsNetworked, false);
    const netid = VehToNet(Vehicle);

    SetModelAsNoLongerNeeded(Model);
    SetVehicleOnGroundProperly(Vehicle);
    SetVehicleHasBeenOwnedByPlayer(Vehicle, true);
    SetVehicleNeedsToBeHotwired(Vehicle, false);
    SetNetworkIdExistsOnAllMachines(netid, true);
    NetworkUseHighPrecisionBlending(netid, true);
    SetNetworkIdCanMigrate(netid, false);
    SetVehicleEngineOn(Vehicle, true, true, true);

    return Vehicle;
}

MRCore.Functions.capitalizeFirstLetter = (string = '') => string.charAt(0).toUpperCase() + string.slice(1);

MRCore.Functions.Notify = function (text, textype = 'primary', length = 5000) {
    TriggerEvent(`swt_notifications:${textype}`, "Notification", text, "left", length, true)
}

MRCore.Functions.SimpleNotify = function (message, color, flash = false, saveToBrief = true) {
    PlaySound(-1, 'Menu_Accept', 'Phone_SoundSet_Default', 0, 0, 1);
    BeginTextCommandThefeedPost('STRING')
    AddTextComponentSubstringPlayerName(message)
    ThefeedNextPostBackgroundColor(color)
    EndTextCommandThefeedPostTicker(flash, saveToBrief)
}

MRCore.Functions.AdvancedNotify = function (message, color, sender, subject, textureDict, iconType, flash = false, saveToBrief = false) {
    PlaySound(-1, 'Menu_Accept', 'Phone_SoundSet_Default', 0, 0, 1);
    BeginTextCommandThefeedPost('STRING')
    AddTextComponentSubstringPlayerName(message)
    ThefeedNextPostBackgroundColor(color)
    EndTextCommandThefeedPostMessagetext(textureDict, textureDict, flash, iconType, sender, subject)
    EndTextCommandThefeedPostTicker(flash, saveToBrief)
}

MRCore.Functions.GenerateUUID = () => new Promise(resolve => {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });

    const timestamp = Date.now().toString();

    let result = '';

    let tsIndex = 0;

    for (let i = 0; i < uuid.length; i++) {
        if (i % 5 === 0 && tsIndex < timestamp.length) {
            result += timestamp[tsIndex++];
        }
        result += uuid[i];
    }

    resolve(result);
});

MRCore.Functions.TriggerCallback = async (name, cb = () => { }, ...args) => {
    try {
        MRCore.ServerCallbacks[name] = cb;
        emitNet("MRCore:Server:TriggerCallback", name, ...args);
    } catch (err) {
        console.log('Error while triggering callback:', err);
        cb(null);
    }
};

MRCore.Functions.RegisterClientCallback = (name, callback) => MRCore.STCCallbacks[name] = callback;

MRCore.Functions.CoreEncrypt = (text, shift = 3) => {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        if (char.match(/[a-z]/i)) {
            let code = text.charCodeAt(i);
            if (code >= 65 && code <= 90) {
                char = String.fromCharCode(((code - 65 + shift) % 26) + 65);
            } else if (code >= 97 && code <= 122) {
                char = String.fromCharCode(((code - 97 + shift) % 26) + 97);
            }
        }
        result += char;
    }
    return result;
}

MRCore.Functions.CoreDecrypt = (text, shift = 3) => MRCore.Functions.CoreEncrypt(text, 26 - shift);

MRCore.Functions.showBusySpinner = (text = 'Loading...') => {
    BeginTextCommandBusyspinnerOn('STRING');
    AddTextComponentSubstringPlayerName(text);
    EndTextCommandBusyspinnerOn(5);
}

MRCore.Functions.hideBusySpinner = () => {
    BusyspinnerOff();
}

MRCore.Functions.GetPlayers = function () {
    const ActivePlayers = GetActivePlayers();
    const Players = ActivePlayers.map(netID => {
        const PlayerServerID = GetPlayerServerId(netID);
        const PlayerPed = GetPlayerPed(netID);
        const PlayerData = Player(PlayerServerID).state.PlayerData;
        return {
            netID,
            PlayerServerID,
            PlayerPed,
            PlayerData,
        }
    });
    return Players;
}

MRCore.Functions.CheatDetected = (reason = 'No reason provided') => MRCore.Functions.TriggerCallback('MRCore:Server:CheaterDetected', () => { }, reason);

MRCore.Functions.GetStreetLabel = function () {
    const Player = PlayerPedId();
    const Coords = GetEntityCoords(Player, false);
    const Street = GetStreetNameAtCoord(Coords.x, Coords.y, Coords.z);
    const StreetLabel = GetStreetNameFromHashKey(Street);
    return StreetLabel;
}

MRCore.Functions.GetVehicleProperties = function (vehicle) {
    if (DoesEntityExist(vehicle)) {
        const [pearlescentColor, wheelColor] = GetVehicleExtraColours(vehicle);

        let [colorPrimary, colorSecondary] = GetVehicleColours(vehicle);

        if (GetIsVehiclePrimaryColourCustom(vehicle)) {
            const [r, g, b] = GetVehicleCustomPrimaryColour(vehicle);
            colorPrimary = [r, g, b];
        }

        if (GetIsVehicleSecondaryColourCustom(vehicle)) {
            const [r, g, b] = GetVehicleCustomSecondaryColour(vehicle);
            colorSecondary = [r, g, b];
        }

        const extras = {};

        for (let extraId = 0; extraId <= 12; extraId++) {
            if (DoesExtraExist(vehicle, extraId)) {
                const state = IsVehicleExtraTurnedOn(vehicle, extraId) === 1;
                extras[extraId] = state;
            }
        }

        let modLivery = GetVehicleMod(vehicle, 48);

        if (GetVehicleMod(vehicle, 48) === -1 && GetVehicleLivery(vehicle) !== 0) {
            modLivery = GetVehicleLivery(vehicle);
        }

        const NumWheels = GetVehicleNumberOfWheels(vehicle);

        const tireHealth = {};

        for (let i = 0; i < NumWheels; i++) {
            tireHealth[i] = GetVehicleWheelHealth(vehicle, i);
        }

        const tireBurstState = {};

        for (let i = 0; i < NumWheels; i++) {
            tireBurstState[i] = IsVehicleTyreBurst(vehicle, i, false);
        }

        const tireBurstCompletely = {};

        for (let i = 0; i < NumWheels; i++) {
            tireBurstCompletely[i] = IsVehicleTyreBurst(vehicle, i, true);
        }

        const windowStatus = {};

        for (let i = 0; i <= 7; i++) {
            windowStatus[i] = IsVehicleWindowIntact(vehicle, i) === 1;
        }

        const doorStatus = {};

        const NumDoors = GetNumberOfVehicleDoors(vehicle);

        for (let i = 0; i < NumDoors; i++) {
            doorStatus[i] = IsVehicleDoorDamaged(vehicle, i) === 1;
        }

        let xenonCustomColor = [];

        const [xenonsCustomColorEnabled, xr, xg, xb] = GetVehicleXenonLightsCustomColor(vehicle);

        if (xenonsCustomColorEnabled) {
            xenonCustomColor = [xr, xg, xb];
        }

        const [paintType_1, color1, pearlescentColor_1] = GetVehicleModColor_1(vehicle);

        const [paintType_2, color2] = GetVehicleModColor_2(vehicle);

        const modBulletProofTires = GetVehicleTyresCanBurst(vehicle);

        const VehicleFuel = exports['FuelManager'].GetFuel(vehicle);

        const headlightBroken = GetIsRightVehicleHeadlightDamaged(vehicle) && GetIsLeftVehicleHeadlightDamaged(vehicle);

        return {
            modelHash: GetEntityModel(vehicle),
            modelID: GetDisplayNameFromVehicleModel(GetEntityModel(vehicle)),
            plate: GetVehicleNumberPlateText(vehicle),
            plateIndex: GetVehicleNumberPlateTextIndex(vehicle),
            bodyHealth: Math.round(GetVehicleBodyHealth(vehicle)),
            engineHealth: Math.round(GetVehicleEngineHealth(vehicle)),
            tankHealth: Math.round(GetVehiclePetrolTankHealth(vehicle)),
            fuelLevel: Math.round(VehicleFuel),
            dirtLevel: Math.round(GetVehicleDirtLevel(vehicle)),
            oilLevel: Math.round(GetVehicleOilLevel(vehicle)),
            color1: colorPrimary,
            color2: colorSecondary,
            pearlescentColor: pearlescentColor,
            dashboardColor: GetVehicleDashboardColour(vehicle),
            wheelColor: wheelColor,
            wheelType: GetVehicleWheelType(vehicle),
            wheelSize: GetVehicleWheelSize(vehicle),
            wheelWidth: GetVehicleWheelWidth(vehicle),
            tireHealth: tireHealth,
            tireBurstState: tireBurstState,
            tireBurstCompletely: tireBurstCompletely,
            windowTint: GetVehicleWindowTint(vehicle),
            windowStatus: windowStatus,
            doorStatus: doorStatus,
            xenonColor: GetVehicleXenonLightsColour(vehicle),
            neonEnabled: [
                IsVehicleNeonLightEnabled(vehicle, 0),
                IsVehicleNeonLightEnabled(vehicle, 1),
                IsVehicleNeonLightEnabled(vehicle, 2),
                IsVehicleNeonLightEnabled(vehicle, 3)
            ],
            neonColor: GetVehicleNeonLightsColour(vehicle),
            headlightColor: GetVehicleHeadlightsColour(vehicle),
            headlightBroken: headlightBroken === 1 ? true : false,
            interiorColor: GetVehicleInteriorColour(vehicle),
            extras: extras,
            tyreSmokeColor: GetVehicleTyreSmokeColor(vehicle),
            modSpoilers: GetVehicleMod(vehicle, 0),
            modFrontBumper: GetVehicleMod(vehicle, 1),
            modRearBumper: GetVehicleMod(vehicle, 2),
            modSideSkirt: GetVehicleMod(vehicle, 3),
            modExhaust: GetVehicleMod(vehicle, 4),
            modFrame: GetVehicleMod(vehicle, 5),
            modGrille: GetVehicleMod(vehicle, 6),
            modHood: GetVehicleMod(vehicle, 7),
            modFender: GetVehicleMod(vehicle, 8),
            modRightFender: GetVehicleMod(vehicle, 9),
            modRoof: GetVehicleMod(vehicle, 10),
            modEngine: GetVehicleMod(vehicle, 11),
            modBrakes: GetVehicleMod(vehicle, 12),
            modTransmission: GetVehicleMod(vehicle, 13),
            modHorns: GetVehicleMod(vehicle, 14),
            modSuspension: GetVehicleMod(vehicle, 15),
            modArmor: GetVehicleMod(vehicle, 16),
            modKit17: GetVehicleMod(vehicle, 17),
            modTurbo: IsToggleModOn(vehicle, 18),
            modKit19: GetVehicleMod(vehicle, 19),
            modSmokeEnabled: IsToggleModOn(vehicle, 20),
            modKit21: GetVehicleMod(vehicle, 21),
            modXenon: IsToggleModOn(vehicle, 22),
            modFrontWheels: GetVehicleMod(vehicle, 23),
            modBackWheels: GetVehicleMod(vehicle, 24),
            modCustomTiresF: GetVehicleModVariation(vehicle, 23),
            modCustomTiresR: GetVehicleModVariation(vehicle, 24),
            modPlateHolder: GetVehicleMod(vehicle, 25),
            modVanityPlate: GetVehicleMod(vehicle, 26),
            modTrimA: GetVehicleMod(vehicle, 27),
            modOrnaments: GetVehicleMod(vehicle, 28),
            modDashboard: GetVehicleMod(vehicle, 29),
            modDial: GetVehicleMod(vehicle, 30),
            modDoorSpeaker: GetVehicleMod(vehicle, 31),
            modSeats: GetVehicleMod(vehicle, 32),
            modSteeringWheel: GetVehicleMod(vehicle, 33),
            modShifterLeavers: GetVehicleMod(vehicle, 34),
            modAPlate: GetVehicleMod(vehicle, 35),
            modSpeakers: GetVehicleMod(vehicle, 36),
            modTrunk: GetVehicleMod(vehicle, 37),
            modHydrolic: GetVehicleMod(vehicle, 38),
            modEngineBlock: GetVehicleMod(vehicle, 39),
            modAirFilter: GetVehicleMod(vehicle, 40),
            modStruts: GetVehicleMod(vehicle, 41),
            modArchCover: GetVehicleMod(vehicle, 42),
            modAerials: GetVehicleMod(vehicle, 43),
            modTrimB: GetVehicleMod(vehicle, 44),
            modTank: GetVehicleMod(vehicle, 45),
            modWindows: GetVehicleMod(vehicle, 46),
            modKit47: GetVehicleMod(vehicle, 47),
            modLivery: modLivery,
            modKit49: GetVehicleMod(vehicle, 49),
            liveryRoof: GetVehicleRoofLivery(vehicle),
            modBulletProofTires: !modBulletProofTires,
            paintType1: paintType_1,
            paintType2: paintType_2,
            xenonCustomColorEnabled: xenonsCustomColorEnabled,
            xenonCustomColor: xenonCustomColor
        };
    } else {
        return {}
    }
};

MRCore.Functions.SetVehicleProperties = function (vehicle, props) {
    if ('extras' in props) {
        for (let [id, enabled] of Object.entries(props.extras)) {
            SetVehicleExtra(vehicle, parseInt(id), enabled ? 0 : 1);
        }
    }

    let [pearlescentColor, wheelColor] = GetVehicleExtraColours(vehicle);

    SetVehicleModKit(vehicle, 0);

    if ('plate' in props) SetVehicleNumberPlateText(vehicle, props.plate);
    if ('plateIndex' in props) SetVehicleNumberPlateTextIndex(vehicle, props.plateIndex);
    if ('bodyHealth' in props) SetVehicleBodyHealth(vehicle, props.bodyHealth);
    if ('engineHealth' in props) SetVehicleEngineHealth(vehicle, props.engineHealth);
    if ('tankHealth' in props) SetVehiclePetrolTankHealth(vehicle, props.tankHealth);
    if ('fuelLevel' in props) exports['FuelManager'].SetFuel(vehicle, props.fuelLevel);
    if ('dirtLevel' in props) SetVehicleDirtLevel(vehicle, props.dirtLevel);
    if ('oilLevel' in props) SetVehicleOilLevel(vehicle, props.oilLevel);

    if ('color1' in props) {
        if (typeof props.color1 === 'number') {
            ClearVehicleCustomPrimaryColour(vehicle);
            SetVehicleModColor_1(vehicle, props.paintType1, props.color1, props.pearlescentColor);
            if (typeof props.color2 === 'number') {
                SetVehicleColours(vehicle, props.color1, props.color2);
            }
        } else {
            SetVehicleModColor_1(vehicle, props.paintType1, 0, props.pearlescentColor);
            SetVehicleCustomPrimaryColour(vehicle, props.color1[0], props.color1[1], props.color1[2]);
        }
    }

    if ('color2' in props) {
        if (typeof props.color2 === 'number') {
            ClearVehicleCustomSecondaryColour(vehicle);
            SetVehicleModColor_2(vehicle, props.paintType2, props.color2);
            if (typeof props.color1 === 'number') {
                SetVehicleColours(vehicle, props.color1, props.color2);
            }
            if (typeof props.color1 !== 'number') {
                SetVehicleModColor_1(vehicle, props.paintType1, 0, props.pearlescentColor);
            }
        } else {
            SetVehicleModColor_2(vehicle, props.paintType2, 0);
            SetVehicleCustomSecondaryColour(vehicle, props.color2[0], props.color2[1], props.color2[2]);
        }
    }

    if ('pearlescentColor' in props) SetVehicleExtraColours(vehicle, props.pearlescentColor, wheelColor);
    if ('interiorColor' in props) SetVehicleInteriorColor(vehicle, props.interiorColor);
    if ('dashboardColor' in props) SetVehicleDashboardColour(vehicle, props.dashboardColor);
    if ('wheelColor' in props) SetVehicleExtraColours(vehicle, props.pearlescentColor || pearlescentColor, props.wheelColor);

    if ('tireHealth' in props) {
        for (let [wheelIndex, health] of Object.entries(props.tireHealth)) {
            SetVehicleWheelHealth(vehicle, parseInt(wheelIndex), health);
        }
    }

    if ('tireBurstState' in props) {
        for (let [wheelIndex, burstState] of Object.entries(props.tireBurstState)) {
            if (burstState) {
                SetVehicleTyreBurst(vehicle, parseInt(wheelIndex), false, 1000.0);
            }
        }
    }

    if ('tireBurstCompletely' in props) {
        for (let [wheelIndex, burstState] of Object.entries(props.tireBurstCompletely)) {
            if (burstState) {
                SetVehicleTyreBurst(vehicle, parseInt(wheelIndex), true, 1000.0);
            }
        }
    }

    if ('modBulletProofTires' in props) SetVehicleTyresCanBurst(vehicle, !props.modBulletProofTires);
    if ('windowTint' in props) SetVehicleWindowTint(vehicle, props.windowTint);
    if ('windowStatus' in props) {
        for (let [windowIndex, smashWindow] of Object.entries(props.windowStatus)) {
            if (!smashWindow) {
                SmashVehicleWindow(vehicle, parseInt(windowIndex));
            }
        }
    }
    if ('doorStatus' in props) {
        for (let [doorIndex, breakDoor] of Object.entries(props.doorStatus)) {
            if (breakDoor) {
                SetVehicleDoorBroken(vehicle, parseInt(doorIndex), true);
            }
        }
    }
    if ('neonEnabled' in props) {
        SetVehicleNeonLightEnabled(vehicle, 0, props.neonEnabled[0]);
        SetVehicleNeonLightEnabled(vehicle, 1, props.neonEnabled[1]);
        SetVehicleNeonLightEnabled(vehicle, 2, props.neonEnabled[2]);
        SetVehicleNeonLightEnabled(vehicle, 3, props.neonEnabled[3]);
    }

    if ('neonColor' in props) SetVehicleNeonLightsColour(vehicle, props.neonColor[0], props.neonColor[1], props.neonColor[2]);
    if ('headlightColor' in props) SetVehicleHeadlightsColour(vehicle, props.headlightColor);
    if ('interiorColor' in props) SetVehicleInteriorColour(vehicle, props.interiorColor);
    if ('wheelSize' in props) SetVehicleWheelSize(vehicle, props.wheelSize);
    if ('wheelWidth' in props) SetVehicleWheelWidth(vehicle, props.wheelWidth);
    if ('tyreSmokeColor' in props) SetVehicleTyreSmokeColor(vehicle, props.tyreSmokeColor[0], props.tyreSmokeColor[1], props.tyreSmokeColor[2]);
    if ('wheelType' in props) SetVehicleWheelType(vehicle, props.wheelType);

    if ('headlightBroken' in props && props.headlightBroken) SetVehicleLights(vehicle, 1);

    // Vehicle mods
    const mods = [
        'modSpoilers', 'modFrontBumper', 'modRearBumper', 'modSideSkirt', 'modExhaust', 'modFrame', 'modGrille',
        'modHood', 'modFender', 'modRightFender', 'modRoof', 'modEngine', 'modBrakes', 'modTransmission', 'modHorns',
        'modSuspension', 'modArmor', 'modKit17', 'modKit19', 'modKit21', 'modFrontWheels', 'modBackWheels',
        'modPlateHolder', 'modVanityPlate', 'modTrimA', 'modOrnaments', 'modDashboard', 'modDial', 'modDoorSpeaker',
        'modSeats', 'modSteeringWheel', 'modShifterLeavers', 'modAPlate', 'modSpeakers', 'modTrunk', 'modHydrolic',
        'modEngineBlock', 'modAirFilter', 'modStruts', 'modArchCover', 'modAerials', 'modTrimB', 'modTank',
        'modWindows', 'modKit47', 'modLivery', 'modKit49'
    ];

    mods.forEach((mod, index) => {
        if (mod in props) {
            SetVehicleMod(vehicle, index, props[mod], false);
        }
    });

    if ('modTurbo' in props) ToggleVehicleMod(vehicle, 18, props.modTurbo);
    if ('modSmokeEnabled' in props) ToggleVehicleMod(vehicle, 20, props.modSmokeEnabled);
    if ('modXenon' in props) ToggleVehicleMod(vehicle, 22, props.modXenon);

    if ('xenonColor' in props) {
        SetVehicleXenonLightsColor(vehicle, props.xenonColor);
    }

    if (props.xenonCustomColorEnabled && props.xenonCustomColor.length > 0) {
        SetVehicleXenonLightsCustomColor(vehicle, props.xenonCustomColor[0], props.xenonCustomColor[1], props.xenonCustomColor[2]);
    }

    if ('modFrontWheels' in props) SetVehicleMod(vehicle, 23, props.modFrontWheels, props.modCustomTiresF);
    if ('modBackWheels' in props) SetVehicleMod(vehicle, 24, props.modBackWheels, props.modCustomTiresR);

    if ('modLivery' in props) {
        SetVehicleMod(vehicle, 48, props.modLivery, false);
        SetVehicleLivery(vehicle, props.modLivery);
    }

    if ('liveryRoof' in props) SetVehicleRoofLivery(vehicle, props.liveryRoof);

    SetDisableVehicleWindowCollisions(vehicle, false);
};