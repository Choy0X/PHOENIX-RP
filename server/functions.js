MRCore.Functions = {};

MRCore.Functions.sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const DiscordBotToken = MRConfig.Server.DiscordBotToken;

let DBConnection = null;

MRCore.Functions.ConsoleLog = (message, error = false) => {
    if (error) {
        console.log(`^1${message}^7`);
    } else {
        console.log(`^2${message}^7`);
    }
}

MRCore.Functions.connectToDD = async function () {
    if (!DBConnection) {
        DBConnection = await rethinkdb.connect({ host: 'localhost', port: 28015, db: 'mrpdb' });
        MRCore.Functions.ConsoleLog('[MRCore]: Connected to Database');
    }
    return DBConnection;
}

MRCore.Functions.getConnection = async function () {
    if (DBConnection) return DBConnection;
    return await MRCore.Functions.connectToDD();
}

MRCore.Functions.createTable = async (tableName) => {
    try {
        const connection = await MRCore.Functions.getConnection();
        const tableList = await rethinkdb.tableList().run(connection);
        if (tableList.includes(tableName)) return [false, `Table ${tableName} already exists`];
        await rethinkdb.tableCreate(tableName).run(DBConnection);
        return true;
    } catch (err) {
        return false
    }
}

MRCore.Functions.fetchData = async (tableName) => {
    try {
        const connection = await MRCore.Functions.getConnection();
        const cursor = await rethinkdb.table(tableName).run(connection);
        const records = await cursor.toArray();
        return records;
    } catch (err) {
        return [];
    }
}

MRCore.Functions.findByID = async (tableName, id) => {
    try {
        const connection = await MRCore.Functions.getConnection();
        const record = await rethinkdb.table(tableName).get(id).run(connection);
        return record ? [record] : [];
    } catch (err) {
        console.log('Function FindByID Error: ', err);
        return [];
    }
}

MRCore.Functions.findByFilter = async (tableName, filter = {}) => {
    try {
        const connection = await MRCore.Functions.getConnection();
        const cursor = await rethinkdb.table(tableName).filter(filter).run(connection);
        const records = await cursor.toArray();
        return records;
    } catch (err) {
        return [];
    }
}

MRCore.Functions.insertRecord = async (tableName, record) => {
    try {
        const connection = await MRCore.Functions.getConnection();
        const result = await rethinkdb.table(tableName).insert(record).run(connection);
        return { inserted: result['inserted'], insertID: result['generated_keys'][0] };
    } catch (err) {
        return { inserted: 0 };
    }
}

MRCore.Functions.updateRecord = async (tableName, id, updatedRecord) => {
    try {
        const connection = await MRCore.Functions.getConnection();
        const result = await rethinkdb.table(tableName).get(id).update(updatedRecord).run(connection);
        return result['replaced'] > 0;
    } catch (err) {
        return false;
    }
}

MRCore.Functions.replaceRecord = async (tableName, id, updatedRecord) => {
    try {
        const connection = await MRCore.Functions.getConnection();
        const result = await rethinkdb.table(tableName).get(id).replace(updatedRecord).run(connection);
        console.log('Replace Record Result: ', result);
        return result['replaced'] > 0;
    } catch (err) {
        console.log('Replace Record Error: ', err);
        return false;
    }
};

MRCore.Functions.deleteRecord = async (tableName, id) => {
    try {
        const connection = await MRCore.Functions.getConnection();
        const result = await rethinkdb.table(tableName).get(id).delete().run(connection);
        return result['deleted'] > 0;
    } catch (err) {
        return false;
    }
}

MRCore.Functions.RandomString = (length = 10) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charactersLength = characters.length;
    let string = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        string += characters.charAt(randomIndex);
    }

    return string;
}

MRCore.Functions.RandomInt = (length = 10) => {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

MRCore.Functions.MathRandom = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

MRCore.Functions.validateName = function (name) {
    var regex = /^[a-zA-Z0-9]+$/;
    return regex.test(name);
};

MRCore.Functions.Notify = (source, message, type = 'primary', duration = 3000) => emitNet('MRCore:Notify', source, message, type, duration);

function GetPlayerIdentifiers(source) {
    let playerIdentifiers = [];
    const identifiers = GetNumPlayerIdentifiers(source);
    for (let i = 0; i < identifiers; i++) {
        const identifier = GetPlayerIdentifier(source, i);
        playerIdentifiers.push(identifier);
    }
    return playerIdentifiers;
}

MRCore.Functions.GetIdentifier = function (source, idtype) {
    const identifiers = GetPlayerIdentifiers(source);
    const idTypeFound = identifiers.find((id) => id.startsWith(idtype));
    return idTypeFound;
}

MRCore.Functions.GetServerIdFromPed = (Ped) => {
    const Players = exports['PHOENIX-RP'].GetAllPlayers();
    for (const Player of Players) {
        const PlayerPed = GetPlayerPed(Player);
        if (Ped === PlayerPed) return Player;
    }
    return null;
}

MRCore.Functions.toCapitalCase = (text = '') => text.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

MRCore.Functions.GenerateRandomPlate = () => {
    const Number = MRCore.Functions.RandomInt(2);
    const FLetter = MRCore.Functions.RandomString(3);
    const LLetter = MRCore.Functions.RandomInt(3);
    return `${Number}${FLetter}${LLetter}`.toLocaleUpperCase();
}

MRCore.Functions.GetVehicleProperties = (ClientVehicleProperties = {}) => {
    const VehicleProperties = {
        "modelHash": ClientVehicleProperties.modelHash ?? null,
        "modelID": ClientVehicleProperties.modelID ?? null,
        "plate": ClientVehicleProperties.plate ?? MRCore.Functions.GenerateRandomPlate(),
        "plateIndex": ClientVehicleProperties.plateIndex ?? 0,
        "bodyHealth": ClientVehicleProperties.bodyHealth ?? 1000,
        "engineHealth": ClientVehicleProperties.engineHealth ?? 1000,
        "tankHealth": ClientVehicleProperties.tankHealth ?? 1000,
        "fuelLevel": ClientVehicleProperties.fuelLevel ?? 100,
        "dirtLevel": ClientVehicleProperties.dirtLevel ?? 0.0,
        "oilLevel": ClientVehicleProperties.oilLevel ?? 100,
        "color1": ClientVehicleProperties.color1 ?? 0,
        "color2": ClientVehicleProperties.color2 ?? 0,
        "pearlescentColor": ClientVehicleProperties.pearlescentColor ?? 0,
        "dashboardColor": ClientVehicleProperties.dashboardColor ?? 0,
        "wheelColor": ClientVehicleProperties.wheelColor ?? 0,
        "wheelType": ClientVehicleProperties.wheelType ?? 0,
        "wheelSize": ClientVehicleProperties.wheelSize ?? 0,
        "wheelWidth": ClientVehicleProperties.wheelWidth ?? 0,
        "tireHealth": ClientVehicleProperties.tireHealth ?? {},
        "tireBurstState": ClientVehicleProperties.tireBurstState ?? {},
        "tireBurstCompletely": ClientVehicleProperties.tireBurstCompletely ?? {},
        "windowStatus": ClientVehicleProperties.windowStatus ?? {},
        "doorStatus": ClientVehicleProperties.doorStatus ?? {},
        "windowTint": ClientVehicleProperties.windowTint ?? 0,
        "extras": ClientVehicleProperties.extras ?? {},
        "xenonColor": ClientVehicleProperties.xenonColor ?? 255,
        "neonEnabled": ClientVehicleProperties.neonEnabled ?? [false, false, false, false],
        "neonColor": ClientVehicleProperties.neonColor ?? [255, 0, 255],
        "headlightColor": ClientVehicleProperties.headlightColor ?? 0,
        "headlightBroken": ClientVehicleProperties.headlightBroken ?? false,
        "interiorColor": ClientVehicleProperties.interiorColor ?? 0,
        "tyreSmokeColor": ClientVehicleProperties.tyreSmokeColor ?? [255, 255, 255],
        "modSpoilers": ClientVehicleProperties.modSpoilers ?? -1,
        "modFrontBumper": ClientVehicleProperties.modFrontBumper ?? -1,
        "modRearBumper": ClientVehicleProperties.modRearBumper ?? -1,
        "modSideSkirt": ClientVehicleProperties.modSideSkirt ?? -1,
        "modExhaust": ClientVehicleProperties.modExhaust ?? -1,
        "modFrame": ClientVehicleProperties.modFrame ?? -1,
        "modGrille": ClientVehicleProperties.modGrille ?? -1,
        "modHood": ClientVehicleProperties.modHood ?? -1,
        "modFender": ClientVehicleProperties.modFender ?? -1,
        "modRightFender": ClientVehicleProperties.modRightFender ?? -1,
        "modRoof": ClientVehicleProperties.modRoof ?? -1,
        "modEngine": ClientVehicleProperties.modEngine ?? -1,
        "modBrakes": ClientVehicleProperties.modBrakes ?? -1,
        "modTransmission": ClientVehicleProperties.modTransmission ?? -1,
        "modHorns": ClientVehicleProperties.modHorns ?? -1,
        "modSuspension": ClientVehicleProperties.modSuspension ?? -1,
        "modArmor": ClientVehicleProperties.modArmor ?? -1,
        "modKit17": ClientVehicleProperties.modKit17 ?? -1,
        "modTurbo": ClientVehicleProperties.modTurbo ?? false,
        "modKit19": ClientVehicleProperties.modKit19 ?? -1,
        "modSmokeEnabled": ClientVehicleProperties.modSmokeEnabled ?? false,
        "modKit21": ClientVehicleProperties.modKit21 ?? -1,
        "modXenon": ClientVehicleProperties.modXenon ?? false,
        "modFrontWheels": ClientVehicleProperties.modFrontWheels ?? -1,
        "modBackWheels": ClientVehicleProperties.modBackWheels ?? -1,
        "modCustomTiresF": ClientVehicleProperties.modCustomTiresF ?? false,
        "modCustomTiresR": ClientVehicleProperties.modCustomTiresR ?? false,
        "modPlateHolder": ClientVehicleProperties.modPlateHolder ?? -1,
        "modVanityPlate": ClientVehicleProperties.modVanityPlate ?? -1,
        "modTrimA": ClientVehicleProperties.modTrimA ?? -1,
        "modOrnaments": ClientVehicleProperties.modOrnaments ?? -1,
        "modDashboard": ClientVehicleProperties.modDashboard ?? -1,
        "modDial": ClientVehicleProperties.modDial ?? -1,
        "modDoorSpeaker": ClientVehicleProperties.modDoorSpeaker ?? -1,
        "modSeats": ClientVehicleProperties.modSeats ?? -1,
        "modSteeringWheel": ClientVehicleProperties.modSteeringWheel ?? -1,
        "modShifterLeavers": ClientVehicleProperties.modShifterLeavers ?? -1,
        "modAPlate": ClientVehicleProperties.modAPlate ?? -1,
        "modSpeakers": ClientVehicleProperties.modSpeakers ?? -1,
        "modTrunk": ClientVehicleProperties.modTrunk ?? -1,
        "modHydrolic": ClientVehicleProperties.modHydrolic ?? -1,
        "modEngineBlock": ClientVehicleProperties.modEngineBlock ?? -1,
        "modAirFilter": ClientVehicleProperties.modAirFilter ?? -1,
        "modStruts": ClientVehicleProperties.modStruts ?? -1,
        "modArchCover": ClientVehicleProperties.modArchCover ?? -1,
        "modAerials": ClientVehicleProperties.modAerials ?? -1,
        "modTrimB": ClientVehicleProperties.modTrimB ?? -1,
        "modTank": ClientVehicleProperties.modTank ?? -1,
        "modWindows": ClientVehicleProperties.modWindows ?? -1,
        "modKit47": ClientVehicleProperties.modKit47 ?? -1,
        "modLivery": ClientVehicleProperties.modLivery ?? -1,
        "modKit49": ClientVehicleProperties.modKit49 ?? -1,
        "liveryRoof": ClientVehicleProperties.liveryRoof ?? -1,
        "modBulletProofTires": ClientVehicleProperties.modBulletProofTires ?? false,
        "paintType1": ClientVehicleProperties.paintType1 ?? 0,
        "paintType2": ClientVehicleProperties.paintType2 ?? 0,
        "xenonCustomColorEnabled": ClientVehicleProperties.xenonCustomColorEnabled ?? false,
        "xenonCustomColor": ClientVehicleProperties.xenonCustomColor ?? []
    };
    
    return VehicleProperties;
}

MRCore.Functions.SendInventoryLog = async function (title, message) {
    if (!MRConfig.Server.sendLog) return;
    try {
        const payload = {
            username: 'Inventory Logs',
            avatar_url: 'https://media.discordapp.net/attachments/1064621821955158056/1069715139340812298/MRPlogo.png',
            embeds: [{
                title: title,
                description: JSON.stringify(message),
            }]
        };
        await axios.post('DISCORD_WEBHOOK_URL', payload, { headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        MRCore.Functions.ConsoleLog('[MRCore]: Failed to send discord log', true);
    }
}

MRCore.Functions.sendDiscordLog = async function (webhookUrl, name, message, success = true) {
    if (!MRConfig.Server.sendLog) return;
    try {
        const payload = {
            username: 'Marruecos Logs',
            avatar_url: 'https://media.discordapp.net/attachments/1064621821955158056/1069715139340812298/MRPlogo.png',
            embeds: [{
                type: 'rich',
                title: name,
                description: message,
                color: success ? parseInt('00ff00', 16) : parseInt('ff0000', 16),
                timestamp: new Date().toISOString(),
            }]
        };
        await axios.post(webhookUrl, payload, { headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        MRCore.Functions.ConsoleLog('[MRCore]: Failed to send discord log' + JSON.stringify(error.response.data), true);
    }
}

MRCore.Functions.GetSource = function (identifier) {
    let source = 0;
    let players = MRCore.Players;
    for (let i = 0; i < players.length; i++) {
        let identifiers = GetPlayerIdentifiers(players[i]);
        for (let i = 0; i < identifiers.length; i++) {
            if (identifiers[i] == identifier) {
                source = players[i];
                break;
            }
        }
    }
    return source;
}

MRCore.Functions.GetPlayer = function (source) {
    const PlayerID = parseInt(source);
    if (isNaN(PlayerID)) return false;
    if (!MRCore.Players.hasOwnProperty(PlayerID)) return false;
    return MRCore.Players[PlayerID];
}

MRCore.Functions.GetPlayerByEmail = function (email) {
    let player = null;
    let players = MRCore.Players;
    for (const ID of Object.keys(players)) {
        if (players[ID].PlayerData.metadata.email == email) {
            player = players[ID];
            break;
        }
    }
    return player;
}

MRCore.Functions.GetPlayerByCitizenId = function (citizenid = '') {
    const Players = MRCore.Players;
    return Object.values(Players).find(Player => Player.PlayerData.citizenid === citizenid);
}

MRCore.Functions.GetPlayerByPhone = function (number) {
    const Players = MRCore.Players;
    let player = null;
    for (const ID of Object.keys(Players)) {
        if (Players[ID].PlayerData.PhoneNumber == number) {
            player = Players[ID];
            break;
        }
    }
    return player;
}

MRCore.Functions.SortObjectByKeys = (Obj = {}) => {
    const sortedKeys = Object.keys(Obj).sort((a, b) => b.localeCompare(a));

    const sortedObject = {};

    for (const key of sortedKeys) {
        sortedObject[key] = Obj[key];
    }

    return sortedObject;
}

MRCore.Functions.GetPlayers = () => MRCore.Players;

MRCore.Functions.CreateCallback = (name, cb) => MRCore.ServerCallbacks[name] = cb;

MRCore.Functions.TriggerCallback = (name, source, cb, ...args) => {
    if (!MRCore.ServerCallbacks[name]) return;
    MRCore.ServerCallbacks[name](source, cb, ...args);
};

MRCore.Functions.TriggerClientCallback = (targetPlayer, callbackName, ...args) => {
    const DEFAULT_TIMEOUT_DELAY = 10000;
    return new Promise(resolve => {
        const cbId = `srv_${Date.now()}_${MRCore.Functions.MathRandom(1000, 9999)}`;
        MRCore.STCCallbacks[cbId] = (result) => {
            resolve(result);
            clearTimeout(MRCore.STCTimeouts[cbId]);
            delete MRCore.STCTimeouts[cbId];
        }
        MRCore.STCTimeouts[cbId] = setTimeout(() => {
            resolve(null);
            delete MRCore.STCCallbacks[cbId];
            delete MRCore.STCTimeouts[cbId];
        }, DEFAULT_TIMEOUT_DELAY);
        emitNet('MRCore:client:STCResponse', targetPlayer, callbackName, cbId, ...args);
    });
}

MRCore.Functions.Kick = function (source, reason) {
    const src = source;
    const KickReason = reason || 'You have been kicked from the server.';
    DropPlayer(src, KickReason);
}

MRCore.Functions.GetGuildRoles = () => MRCore.Guild.Roles;

/*MRCore.Functions.IsWhitelisted = async function (source) {
    const whitelistRole = MRConfig.Server.DiscordWhiteListRole;
    const NotWhitelistedMessage = MRConfig.Server.Discord_Not_Whitelisted_Message;
    const discordID = MRCore.Functions.GetIdentifier(source, "discord:");

    if (!discordID || discordID.length < 1) return [false, 'We Failed to get your Discord ID. Try to restart Fivem & Discord.'];

    try {
        const response = await axios.get(`https://discordapp.com/api/guilds/942573350662856706/members/${discordID.substr(8)}`, {
            headers: {
                Authorization: `Bot ${DiscordBotToken}`,
                'Content-type': 'application/json',
            },
        });

        const data = response.data;
        const roles = data.roles || [];
        const whitelisted = roles.includes(whitelistRole);

        if (whitelisted) return [true, whitelisted];

        return [false, NotWhitelistedMessage];
    } catch (err) {
        return [false, 'We Failed to check your Discord roles. Please try again.'];
    }
};*/

MRCore.Functions.IsWhitelisted = function (source) {
    const whitelistRole = MRConfig.Server.DiscordWhiteListRole;
    const NotWhitelistedMessage = MRConfig.Server.Discord_Not_Whitelisted_Message;
    const discordID = MRCore.Functions.GetIdentifier(source, "discord:");

    if (!discordID || discordID.length < 1) return [false, 'We Failed to get your Discord ID. Try to restart Fivem & Discord.'];

    const PlayerDiscordInfo = MRCore.Functions.GetPlayerDiscordInfo(discordID);

    if (!PlayerDiscordInfo) return [false, 'We Failed to get your Discord Info. Try to restart Fivem & Discord.'];

    const whitelisted = PlayerDiscordInfo.roles.includes(whitelistRole);

    if (!whitelisted) return [false, NotWhitelistedMessage];

    return [true, 'You are whitelisted.'];
}

MRCore.Functions.GetDiscordInfo = async function (discord) {
    try {
        const response = await axios.get(`https://discordapp.com/api/guilds/942573350662856706/members/${discord.substr(8)}`, {
            headers: {
                Authorization: `Bot ${DiscordBotToken}`,
                'Content-type': 'application/json',
            },
        });

        const data = response.data;
        const roles = data.roles || [];

        const roleNames = roles.map(role => MRCore.Guild.Roles[role]);

        return {
            id: data.user.id,
            avatar: data.user.avatar,
            username: data.user.username,
            roles: roleNames,
        }

    } catch (err) {
        return {
            id: null,
            username: 'Not Found',
            avatar: null,
            roles: [],
        }
    }
}

MRCore.Functions.GetPlayerTokens = function (source) {
    const numTokens = GetNumPlayerTokens(source);
    const PlayerTokens = [];
    for (let i = 0; i < numTokens; i++) {
        const token = GetPlayerToken(source, i);
        PlayerTokens.push(token);
    }
    return PlayerTokens;
}

MRCore.Functions.isVIP = async function (source) {
    const src = source;
    const discord = MRCore.Functions.GetIdentifier(src, 'discord:');
    const Query = await MRCore.Functions.findByFilter('vip', { discord });
    return Query.length > 0;
}

MRCore.Functions.AddPermission = function (source, permission) {
    const Player = MRCore.Functions.GetPlayer(source);

    if (!Player) return [false, 'Player not found'];

    const permissionLower = permission.toLowerCase();

    if (!MRConfig.Server.AvailablePermissions.includes(permissionLower)) return [false, 'Permission not available'];

    Player.Functions.SetPermission(permissionLower);

    emitNet('chat:addMessage', source, {
        template:
            '<div class="chat-message" style="background-color: rgba(35, 191, 4, 0.75); box-shadow: rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px inset;"><b>Attention</b>: You have become an ({0}).</div>',
        args: [permissionLower],
    });

    emitNet('MRCore:Client:PermissionChanged', source, permissionLower);

    MRCore.Commands.Refresh(source);

    return [true, 'Permission added successfully'];
};

MRCore.Functions.RemovePermission = function (source) {
    const Player = MRCore.Functions.GetPlayer(source);

    if (!Player) return [false, 'Player not found'];

    Player.Functions.SetPermission('user');

    emitNet('MRCore:Notify', source, 'You have been removed from the staff team.', 'error');

    emitNet('MRCore:Client:PermissionChanged', source, 'user');

    MRCore.Commands.Refresh(source);

    return [true, 'Permission removed successfully'];
};

MRCore.Functions.HasPermission = function (source, permission = 'user') {
    const Player = MRCore.Functions.GetPlayer(source);
    return Player ? (Player.PlayerData.permission === 'root' || Player.PlayerData.permission === permission) : false;
}

MRCore.Functions.GetPermission = function (source) {
    const Player = MRCore.Functions.GetPlayer(source);
    return Player ? Player.PlayerData.permission : 'user';
}

function convertTimestamp(timestamp) {
    const diff = timestamp; // convert to milliseconds
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12); // Calculate the number of years

    let result = "";
    if (years > 0) {
        result += `${years} year${years > 1 ? "s" : ""}, `;
    }
    if (months % 12 > 0) {
        result += `${months % 12} month${months % 12 > 1 ? "s" : ""}, `;
    }
    if (days % 30 > 0) {
        result += `${days % 30} day${days % 30 > 1 ? "s" : ""}, `;
    }
    if (hours % 24 > 0) {
        result += `${hours % 24} hour${hours % 24 > 1 ? "s" : ""}`;
    }
    if (result === "") {
        result = "less than an hour ago";
    }
    return result;
}

MRCore.Functions.Capitalize = (text) => text.toLowerCase().charAt(0).toUpperCase() + (text.slice(1).toLowerCase())

function daysToMs(days) {
    const millisecondsInADay = 24 * 60 * 60 * 1000;
    const milliseconds = days * millisecondsInADay;
    return milliseconds;
}

MRCore.Functions.GetDistanceBetweenCoords = (x1, y1, z1, x2, y2, z2, useZ) => {
    const x = x1 - x2;
    const y = y1 - y2;
    const z = useZ ? z1 - z2 : 0.0;
    const distance = Math.sqrt(x * x + y * y + z * z);
    return isNaN(distance) ? Infinity : distance;
}

MRCore.Functions.GetOffsetFromEntityInWorldCoords = (entity, offX, offY, offZ) => {
    const rot = GetEntityRotation(entity, 2); // ZXY rotation order
    const rx = rot[0] * Math.PI / 180;
    const ry = rot[1] * Math.PI / 180;
    const rz = rot[2] * Math.PI / 180;

    const matrix = [
        [
            Math.cos(rz) * Math.cos(ry) - Math.sin(rz) * Math.sin(rx) * Math.sin(ry),
            Math.cos(ry) * Math.sin(rz) + Math.cos(rz) * Math.sin(rx) * Math.sin(ry),
            -Math.cos(rx) * Math.sin(ry),
            1
        ],
        [
            -Math.cos(rx) * Math.sin(rz),
            Math.cos(rz) * Math.cos(rx),
            Math.sin(rx),
            1
        ],
        [
            Math.cos(rz) * Math.sin(ry) + Math.cos(ry) * Math.sin(rz) * Math.sin(rx),
            Math.sin(rz) * Math.sin(ry) - Math.cos(rz) * Math.cos(ry) * Math.sin(rx),
            Math.cos(rx) * Math.cos(ry),
            1
        ],
        [
            GetEntityCoords(entity)[0],
            GetEntityCoords(entity)[1],
            GetEntityCoords(entity)[2] - 1.0,
            1
        ]
    ];

    const x = offX * matrix[0][0] + offY * matrix[1][0] + offZ * matrix[2][0] + matrix[3][0];
    const y = offX * matrix[0][1] + offY * matrix[1][1] + offZ * matrix[2][1] + matrix[3][1];
    const z = offX * matrix[0][2] + offY * matrix[1][2] + offZ * matrix[2][2] + matrix[3][2];

    return [x, y, z];
}

MRCore.Functions.BanPlayer = async function (target, reason = 'Banned By Choy Anticheat', duration = 3650) {
    const src = target;
    if (!src) return;
    const discordID = MRCore.Functions.GetIdentifier(src, 'discord:');
    const license = MRCore.Functions.GetIdentifier(src, 'license:');
    const token = GetPlayerToken(src, 0);
    const name = GetPlayerName(src);
    if (!discordID || !license || !token) return;
    const banTime = Date.now() + daysToMs(duration);
    const query = `INSERT INTO bans (name, license, discord, token, reason, expire)
                   VALUES (?, ?, ?, ?, ?, ?)
                   ON DUPLICATE KEY UPDATE
                   reason = VALUES(reason),
                   expire = VALUES(expire)`;
    await MRCore.Functions.Query(query, [name, license, discordID, token, reason, banTime]);
    return DropPlayer(src, reason);
};

MRCore.Functions.IsPlayerBanned = async function (source) {
    try {
        const src = source;
        const discordID = MRCore.Functions.GetIdentifier(src, 'discord:');
        const license = MRCore.Functions.GetIdentifier(src, 'license:');
        const PlayerTokens = MRCore.Functions.GetPlayerTokens(src);

        const [ABRetrival, AllBans] = await MRCore.Functions.fetchData('bans');

        if (!ABRetrival) return [false, 'Sorry, we could not check your ban status.'];

        for (const ban of AllBans) {
            const banID = ban.id;
            const banDiscordID = ban.discord;
            const baLicenseID = ban.license;
            const banTokens = ban.tokens;
            const banExpire = ban.expire;
            const banReason = ban.reason;

            const isTokenInBans = banTokens.some(token => PlayerTokens.includes(token));

            if (banDiscordID === discordID || baLicenseID === license || isTokenInBans) {
                const expireTime = parseInt(banExpire);
                const nowTime = Date.now();
                const diff = expireTime - nowTime;
                const RemainingTime = convertTimestamp(diff);

                if (diff > 0) {
                    return [true, `You have been banned for ${banReason}. Remaining Time: ${RemainingTime} Ban ID: ${banID}`];
                } else {
                    await MRCore.Functions.deleteRecord('bans', banID);
                }
            }
        }

        return [false, 'You are not banned.'];
    } catch (err) {
        MRCore.Functions.ConsoleLog('[MRCore]: Error Caught During Ban Check: ' + err, true);
        return [false, 'Sorry, we could not check your ban status.'];
    }
};

const fetchGuildRoles = async () => {
    try {
        const roleResponse = await axios.get('https://discordapp.com/api/guilds/942573350662856706/roles', {
            headers: {
                Authorization: `Bot ${DiscordBotToken}`,
                'Content-type': 'application/json',
            },
        });

        const roles = roleResponse.data;

        roles.forEach(role => MRCore.Guild.Roles[role.id] = role.name);

        return [true, 'Roles Fetched'];
    } catch (err) {
        return [false, err];
    }
}

const fetchGuildMembers = async () => {
    try {
        let after = null;
        let hasMore = true;

        while (hasMore) {
            const memberResponse = await axios.get(`https://discordapp.com/api/guilds/942573350662856706/members`, {
                headers: {
                    Authorization: `Bot ${DiscordBotToken}`,
                    'Content-type': 'application/json',
                },
                params: {
                    limit: 1000,
                    after: after,
                }
            });

            const members = memberResponse.data;

            members.forEach(member => {
                MRCore.Guild.Members[member.user.id] = {
                    id: member.user.id,
                    avatar: member.user.avatar,
                    username: member.user.username,
                    roles: member.roles,
                    rolesName: member.roles.map(role => MRCore.Guild.Roles[role] || 'Unknown Role'),
                };
            });

            if (members.length < 1000) {
                hasMore = false;
            } else {
                after = members[members.length - 1].user.id;
            }
        }

        return [true, 'Members Fetched'];

    } catch (err) {
        return [false, err];
    }
}

MRCore.Functions.GetPlayerDiscordInfo = (discordsub = '') => {
    const discordID = discordsub ? discordsub.replace('discord:', '') : null;
    return MRCore.Guild.Members[discordID];
}

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

setImmediate(async () => {
    const [RLRetrieval, RLError] = await fetchGuildRoles();
    const [MRRetrieval, MRError] = await fetchGuildMembers();

    if (!RLRetrieval) return MRCore.Functions.ConsoleLog(`[MRCore]: Failed to fetch roles: ${RLError}`, true);
    if (!MRRetrieval) return MRCore.Functions.ConsoleLog(`[MRCore]: Failed to fetch members: ${MRError}`, true);

    MRCore.Functions.ConsoleLog('[MRCore]: Roles and Members Fetched, Server is Ready to Join');

    GlobalState.CommandsList = MRCore.Commands.List;

    MRCore.Functions.ConsoleLog('[MRCore]: Commands List Updated Successfully');

    MRConfig.Server.readytojoin = true;
});

const refreshTime = MRConfig.Server.DiscordUpdateTimePerMin;

cron.schedule(`*/${refreshTime} * * * *`, async () => {
    const [RLRetrieval, RLError] = await fetchGuildRoles();
    const [MRRetrieval, MRError] = await fetchGuildMembers();

    if (!RLRetrieval) return MRCore.Functions.ConsoleLog(`[MRCore]: Failed to fetch roles: ${RLError}`, true);
    if (!MRRetrieval) return MRCore.Functions.ConsoleLog(`[MRCore]: Failed to fetch members: ${MRError}`, true);

    MRCore.Functions.ConsoleLog('[MRCore]: Roles and Members Updated Successfully');
});

console.log('Init All MRCore Functions');
