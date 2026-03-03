MRCore.Commands = {};
MRCore.Commands.List = {};

MRCore.Commands.Add = function (CommandName, help, arguments, argsrequired, callback, permission = 'user') {
    const name = CommandName.toLowerCase();
    MRCore.Commands.List[name] = {
        name,
        permission,
        help,
        arguments,
        argsrequired,
        callback,
    };
};

/*MRCore.Commands.Add(name, help, arguments, argsrequired, callback, permission);*/

MRCore.Commands.Refresh = function (source) {
    console.log('[COMMANDS] Refreshing Commands for: ' + source);
    const Player = MRCore.Functions.GetPlayer(source);
    if (!Player) return console.log('[COMMANDS] Player not found!');
    for (const command in MRCore.Commands.List) {
        const info = MRCore.Commands.List[command];
        const HasPermission = MRCore.Functions.HasPermission(source, "root") || MRCore.Functions.HasPermission(source, MRCore.Commands.List[command].permission);
        if (HasPermission) {
            emitNet('chat:addSuggestion', source, "/" + command, info.help, info.arguments);
        } else {
            emitNet('chat:removeSuggestion', source, "/" + command);
        }
    }
};

MRCore.Commands.Add('refreshcommands', 'Refresh the commands', [{ name: 'areyousure', help: 'Are you sure you want to refresh the commands? (Yes / No)' }], true, async function (source, args) {
    const areyousure = args[0];
    if (!areyousure || typeof areyousure !== 'string' || areyousure.length < 2) return emitNet('MRCore:Notify', source, 'Are you sure is not filled in!', 'error');
    if (areyousure.toLowerCase() !== 'yes') return emitNet('MRCore:Notify', source, 'You have not confirmed the refresh!', 'error');
    const AllPlayers = exports['PHOENIX-RP'].GetAllPlayers();
    emitNet('MRCore:Notify', source, 'Refreshing Commands for ' + AllPlayers.length + ' Players', 'primary');
    for (const player of AllPlayers) {
        MRCore.Commands.Refresh(player);
        emitNet('MRCore:Notify', player, 'Commands have been refreshed!', 'primary');
        await MRCore.Functions.sleep(100);
    }
}, 'root');

MRCore.Commands.Add('id', "Get your Current Session ID", [], false, function (source, args) {
    emitNet('chat:addMessage', source, { template: '<div class="chat-message" style="background-color: rgba(0, 145, 255, 1); box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;">ID: <b>[{0}]</b></div>', args: [source] });
});

MRCore.Commands.Add("tp", "Teleport to a player", [{ name: "id", help: "Player ID" }], false, function (source, args) {
    if (!args[0]) return emitNet('chatMessage', source, "SYSTEM", "error", "Player ID is not filled in!");
    const player = MRCore.Functions.GetPlayer(parseInt(args[0]));
    if (!player) return emitNet('chatMessage', source, "SYSTEM", "error", "Player is not online!");
    const PlayerPed = GetPlayerPed(parseInt(args[0]));
    const PlayerCoords = GetEntityCoords(PlayerPed);
    emitNet('MRCore:Command:TeleportToCoords', source, PlayerCoords);
}, "admin");

MRCore.Commands.Add("tpc", "Teleport to a location by coords", [{ name: "x", help: "X position" }, { name: "y", help: "Y position" }, { name: "z", help: "Z position" }], false, function (source, args) {
    if (!args[0] || !args[1] || !args[2]) return emitNet('chatMessage', source, "SYSTEM", "error", "Not every argument is filled in (x, y, z)");
    const x = parseFloat(args[0]);
    const y = parseFloat(args[1]);
    const z = parseFloat(args[2]);
    emitNet('MRCore:Command:TeleportToCoords', source, [x, y, z]);
}, "admin");

MRCore.Commands.Add("setgroup", "Give permission to someone", [{ name: "id", help: "ID of the player" }, { name: "permission", help: "Permission level" }], true, function (source, args) {
    const Player = MRCore.Functions.GetPlayer(parseInt(args[0]));
    const permission = args[1].toLowerCase();
    const AvPermissions = MRCore.Config.Server.AvailablePermissions;
    if (!permission || permission.length < 2) return emitNet('MRCore:Notify', source, 'Permission is not filled in!', 'error');
    if (!AvPermissions.includes(permission)) return emitNet('MRCore:Notify', source, 'Permission is not available!', 'error');
    if (!Player) return emitNet('MRCore:Notify', source, 'Player is not online!', 'error');
    MRCore.Functions.AddPermission(Player.PlayerData.source, permission);
}, "root");

MRCore.Commands.Add("removegroup", "Take permission from someone", [{ name: "id", help: "ID of the player" }], true, (source, args) => {
    const Player = MRCore.Functions.GetPlayer(parseInt(args[0]));
    if (!Player) return emitNet('MRCore:Notify', source, 'Player is not online!', 'error');
    MRCore.Functions.RemovePermission(Player.PlayerData.source);
}, 'root');

MRCore.Commands.Add("group", "Get Your current Group (Permission)", [], false, function (source, args) {
    const Player = MRCore.Functions.GetPlayer(source);

    if (!Player) return emitNet('MRCore:Notify', source, 'We Couldn\'t load your data!', 'error');

    const permission = MRCore.Functions.GetPermission(source);

    return emitNet('MRCore:Notify', source, 'Your current group is: ' + MRCore.Functions.Capitalize(permission), 'primary');
});

MRCore.Commands.Add("car", "Spawn a vehicle", [{ name: "model", help: "Model name of the vehicle" }], true, (source, args) => {
    emitNet('MRCore:Command:SpawnVehicle', source, args[0], 'admin');
}, 'admin');

MRCore.Commands.Add("dv", "Delete a vehicle", [], false, (source, args) => {
    const Ped = GetPlayerPed(source);
    const Vehicle = GetVehiclePedIsIn(Ped, false);
    if (!Vehicle) return emitNet('MRCore:Notify', source, 'You are not in a vehicle!', 'error');
    DeleteEntity(Vehicle);
    emitNet('MRCore:Notify', source, 'Vehicle Deleted', 'success');
}, 'admin');

MRCore.Commands.Add('dvp', 'Delete a vehicle by plate', [{ name: 'plate', help: 'Plate of the vehicle' }], true, (source, args) => {
    const plate = args[0];
    if (!plate || typeof plate !== 'string' || plate.length < 3) return emitNet('MRCore:Notify', source, 'Invalid Plate!', 'error');
    const AllVehicles = GetAllVehicles();
    for (let i = 0; i < AllVehicles.length; i++) {
        const veh = AllVehicles[i];
        if (GetVehicleNumberPlateText(veh) === plate) {
            DeleteEntity(veh);
            return emitNet('MRCore:Notify', source, 'Vehicle Deleted', 'success');
        }
    }
    emitNet('MRCore:Notify', source, 'Vehicle not found!', 'error');
}, 'admin');

MRCore.Commands.Add("tpm", "Teleport to a marker", [], false, (source, args) => {
    const permRequired = 'root';
    emitNet('MRCore:Command:GoToMarker', source, permRequired);
}, 'root');

MRCore.Commands.Add("givemoney", "Give money to a player", [{ name: "id", help: "Player ID" }, { name: "moneytype", help: "Type of money (cash, bank)" }, { name: "amount", help: "Amount" }], true, function (source, args) {
    const Player = MRCore.Functions.GetPlayer(parseInt(args[0]));
    if (!Player) return emitNet('MRCore:Notify', source, 'Player is not online!', 'error');
    Player.Functions.AddMoney(args[1], parseInt(args[2]));
}, "root");

MRCore.Commands.Add("setmoney", "Set the money for a player", [{ name: "id", help: "Player ID" }, { name: "moneytype", help: "Type of money (cash, bank)" }, { name: "amount", help: "Amount" }], true, function (source, args) {
    const Player = MRCore.Functions.GetPlayer(parseInt(args[0]));
    if (!Player) return emitNet('MRCore:Notify', source, 'Player is not online!', 'error');
    Player.Functions.SetMoney(args[1], parseInt(args[2]));
}, "root");

MRCore.Commands.Add("setjob", "Set player job", [{ name: "id", help: "Player ID" }, { name: "job", help: "Job name" }, { name: "grade", help: "Job grade [Number]" }], true, function (source, args) {
    const TargetServerID = parseInt(args[0]);
    if (isNaN(TargetServerID) || TargetServerID < 1) return emitNet('MRCore:Notify', source, 'Invalid Player ID!', 'error');
    const Player = MRCore.Functions.GetPlayer(TargetServerID);
    if (!Player) return emitNet('MRCore:Notify', source, 'Player is not online!', 'error');
    const [success, message, PlayerJob] = Player.Functions.SetJob(args[1], args[2]);
    emitNet('MRCore:Notify', source, message, success ? 'primary' : 'error');
    emitNet('chat:addMessage', TargetServerID, { template: '<div class="chat-message" style="background-color: rgba(35, 191, 4, 0.75); box-shadow: rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px inset;"><b>Attention</b>: You have been assigned a new job as a ({0}). Your grade for this job is ({1}). Please report for duty if you are currently off duty</div>', args: [PlayerJob.label, PlayerJob.grade.label] });
}, "root");

MRCore.Commands.Add('job', 'See your job info', [], false, (source, args) => {
    const Player = MRCore.Functions.GetPlayer(source);
    if (!Player) return;
    const duty = Player.PlayerData.job.onduty ? 'On duty' : 'Off duty';
    const grade = Player.PlayerData.job.grade ? Player.PlayerData.job.grade.label : '';
    const jobName = Player.PlayerData.job.label;

    emitNet('chat:addMessage', source, {
        template: '<div class="chat-message" style="background-color: rgba(0, 0, 0, 0.75); box-shadow: rgba(255, 255, 255, 0.2) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0.9) 0px 0px 0px 1px;"><b>Job Information</b>: You are currently {0} as a {1}{2}. {3}</div>',
        args: [duty, jobName, grade ? ` with the grade of ${grade}` : '', duty === 'On duty' ? 'Please report to your assigned location.' : 'Enjoy your off-duty time.']
    });
});

MRCore.Commands.Add('pub', 'Advertise in the city', [{ name: 'Message', help: 'Information of the publication:' }], false, (source, args) => {
    const message = args.join(' ');

    const Player = MRCore.Functions.GetPlayer(source);

    if (message.length <= 10) return emitNet('MRCore:Notify', -1, 'Announcement should contains atleast 10 characters', 'error');

    if (message.length >= 100) return emitNet('MRCore:Notify', -1, 'Announcement should not contain more than 100 characters', 'error');

    if (!Player) return;

    const FirstName = Player.PlayerData.charinfo.firstname;
    const LastName = Player.PlayerData.charinfo.lastname;
    const phoneNumber = Player.PlayerData.charinfo.phone;

    const FullName = `${FirstName} ${LastName}`.toUpperCase();

    const RandomMoney = MRCore.Functions.MathRandom(1.5, 4.5);

    const [Removed, Message] = Player.Functions.RemoveMoney('cash', RandomMoney * message.length, 'payment', 'Transaction', 'Newspaper Publication');

    if (Removed) {
        emitNet('chat:addMessage', -1, { template: '<div class="chat-message" style="background-color: rgba(255, 66, 66, 0.75); box-shadow: rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset;">An <b>announcement</b> on the newspaper of the city published by <i>{0}</i>, Information of the publication: <b><u>{1}</u></b> | Phone Number: {2}</div>', args: [FullName, message, phoneNumber] });
    } else {
        emitNet('MRCore:Notify', source, Message, 'error');
    }
});

MRCore.Commands.Add('ooc', 'Talk in Global Out of Character chat', [{ name: 'message', help: 'Write something you would like to say to Globaly and HRP.' }], false, (source, args) => {
    const message = args.join(' ');

    const Player = MRCore.Functions.GetPlayer(source);

    if (!Player) return;

    emitNet('MRCore:Client:OutOfCharacter', -1, source, GetPlayerName(source), message);
});

MRCore.Commands.Add('meooc', 'Talk in Local Out of Character chat', [{ name: 'message', help: 'Write something you would like to say to Localy and HRP.' }], false, (source, args) => {
    const message = args.join(' ');

    const Player = MRCore.Functions.GetPlayer(source);

    if (!Player) return;

    emitNet('MRCore:Client:LocalOutOfCharacter', -1, source, GetPlayerName(source), message);
});

MRCore.Commands.Add('clearserverchat', 'Clear Server Chat', [], false, (source, args) => {
    emitNet('chat:clear', -1);
    emitNet('MRCore:Notify', -1, 'Server Chat Cleared', 'error');
}, 'admin');