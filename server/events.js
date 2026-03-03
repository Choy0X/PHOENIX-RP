on('playerDropped', async (reason) => {
    const src = global.source;
    const PlayerName = GetPlayerName(src);

    if (src in MRCore.ConnectedPlayers) delete MRCore.ConnectedPlayers[src];

    MRCore.Player.Save(src, reason);

    MRCore.Functions.sendDiscordLog(MRConfig.Server.Discord_Webhook_Join_Leave, 'Player Left', PlayerName.toUpperCase() + ' has left the server. Reason: ' + reason, false);
})

const MaxServerSlots = GetConvarInt('sv_maxclients', 32);

const Queue = [];

const GetQueueList = () => {
    const vipUsers = Queue.filter(user => user.isvip).sort((a, b) => a.position - b.position);

    vipUsers.forEach((vipUser, index) => {
        vipUser.position = index + 1;
    });

    let currentPosition = vipUsers.length + 1;
    const updatedQueue = Queue.map(user => {
        if (!user.isvip) {
            user.position = currentPosition++;
        }
        return user;
    });

    updatedQueue.sort((a, b) => {
        if (a.isvip && !b.isvip) {
            return -1;
        } else if (!a.isvip && b.isvip) {
            return 1;
        } else {
            return a.position - b.position;
        }
    });

    return updatedQueue;
}

/*onNet('queue:server:playerJoined', () => {
    const src = global.source;
    const License = MRCore.Functions.GetIdentifier(src, 'license:');
    if (Queue.length === 0) return;
    const CheckPlayerExist = Queue.findIndex(user => user.license === License);
    if (CheckPlayerExist === -1) return;
    Queue.splice(CheckPlayerExist, 1);
});*/

on('playerJoining', async (oldsource) => {
    const source = global.source;
    const License = MRCore.Functions.GetIdentifier(source, 'license:');

    if (Queue.length === 0) return;

    const CheckPlayerExist = Queue.findIndex(user => user.license === License);

    if (CheckPlayerExist === -1) return;

    Queue.splice(CheckPlayerExist, 1);
})

on('playerConnecting', async (playerName, setKickReason, deferrals) => {
    const src = global.source;

    deferrals.defer();

    deferrals.update(`Getting your identifiers..`);

    const License = MRCore.Functions.GetIdentifier(src, 'license:');
    const Discord = MRCore.Functions.GetIdentifier(src, 'discord:');

    const PlayerTokens = MRCore.Functions.GetPlayerTokens(src);

    deferrals.update(`Checking server status..`);

    if (!MRCore.Config.Server.readytojoin) return deferrals.done('The server is currently unavailable for joining. Please attempt to join again at a later time.');

    if (MRCore.Config.Server.closed) return deferrals.done('Server is currently closed. Please try again later.');

    deferrals.update(`Validating your name..`);

    const symbolRegex = /[\p{S}\p{P}]/u;

    if (playerName.length > 30 || symbolRegex.test(playerName)) return deferrals.done('Your name contains invalid characters or is too long. \n Please change your name and try again.');

    if (MRConfig.Server.BannedWords.some(word => playerName.toLowerCase().includes(word))) return deferrals.done('Your name contains a bad word. \n Please change your name and try again.');

    deferrals.update(`Checking your identifiers..`);

    if (!License) return deferrals.done('No Social Club Account Found. Please restart FiveM and try again.');

    if (!Discord) return deferrals.done('Discord Not Detected. Please ensure that Discord is running. Restart FiveM and try again.');

    if (PlayerTokens.length === 0) return deferrals.done('No Fivem ID Found. Please restart FiveM and try again.');

    deferrals.update(`Checking your ban status..`);

    const [isBanned, isBannedError] = await MRCore.Functions.IsPlayerBanned(src);

    if (isBanned) return deferrals.done(isBannedError);

    deferrals.update(`Checking your whitelist status..`);

    const [isWhitelisted, isWhitelistedError] = MRCore.Functions.IsWhitelisted(src);

    if (!isWhitelisted) return deferrals.done(isWhitelistedError);

    deferrals.update('Checking your queue position..')

    const isVip = await MRCore.Functions.isVIP(src);

    Queue.push({
        src,
        position: Queue.length + 1,
        isvip: isVip,
        license: License,
    });

    const QueueChecker = setInterval(async () => {
        const FreeSlots = MaxServerSlots - GetNumPlayerIndices();

        console.log('Free Slots', FreeSlots, 'Max Server Slots', MaxServerSlots, 'Current Players', GetNumPlayerIndices());

        const QueueList = GetQueueList();

        Queue.forEach((user, index) => {
            const Name = GetPlayerName(user.src);
            if (Name === null) Queue.splice(index, 1);
        });

        const MyQueue = QueueList.find(user => user.src === src);

        if (!MyQueue) {
            deferrals.done('Try to reconnect.');
            clearInterval(QueueChecker);
        }

        const MyPosition = MyQueue ? MyQueue.position : 0;
        const LastPosition = QueueList.sort((a, b) => b.position - a.position)[0].position;

        deferrals.update(`You are in queue. Position: ${MyPosition} / ${LastPosition}`);

        if (GetPlayerName(MyQueue.src) === null) {
            const FindIndex = Queue.findIndex(user => user.src === src);
            if (FindIndex !== -1) Queue.splice(FindIndex, 1);
            deferrals.done('Try to reconnect.');
            return clearInterval(QueueChecker);
        }

        if (FreeSlots > 0 && MyPosition === 1) {
            deferrals.done();
            clearInterval(QueueChecker);
        }
    }, 2000);
});

onNet('MRCore:server:CloseServer', (reason) => {
    const src = global.source;
    if (MRCore.Functions.HasPermission(src, 'root')) {
        MRCore.Config.Server.closed = true;
        MRCore.Config.Server.closeReason = reason;
        emitNet('MRadmin:client:SetServerStatus', -1, true);
    } else {
        // BAN PLAYER
    }
});

onNet('MRCore:server:OpenServer', () => {
    const src = global.source;
    if (MRCore.Functions.HasPermission(src, 'root')) {
        MRCore.Config.Server.closed = false;
        MRCore.Config.Server.closeReason = '';
        emitNet('MRadmin:client:SetServerStatus', -1, false);
    } else {
        // BAN PLAYER
    }
});

onNet('MRCore:server:KickMe', (reason = 'No Reason Provided') => {
    const src = global.source;
    DropPlayer(src, reason);
});

onNet('MRCore:UpdateEatStatus', () => {
    const src = global.source;
    const Player = MRCore.Functions.GetPlayer(src);

    if (!Player) return;

    var newHunger = Player.PlayerData.metadata['hunger'] - MRCore.Functions.MathRandom(2, 17);
    var newThirst = Player.PlayerData.metadata['thirst'] - MRCore.Functions.MathRandom(3, 18);

    if (newHunger <= 0) {
        newHunger = 0;
    }

    if (newThirst <= 0) {
        newThirst = 0;
    }

    Player.Functions.SetMetaData('hunger', newHunger);
    Player.Functions.SetMetaData('thirst', newThirst);
    emitNet('MRCore:Notify', src, 'You start to feel hungry and thirsty..');
    emitNet('MRCore:Hud:UpdatePlayer', src);
});

/*onNet('MRCore:ReceivedSalary', () => {
    const src = global.source;
    const Player = MRCore.Functions.GetPlayer(src);

    if (!Player) return;

    const amount = parseInt(Player.PlayerData.job.payment);

    if (Player.PlayerData.job.onduty) {
        Player.Functions.AddMoney('bank', amount, 'received-salary');
        emitNet('MRCore:Notify', src, `You received your salary of $${amount}`);
    } else {
        Player.Functions.AddMoney('cash', amount / 2, 'received-salary');
        emitNet('MRCore:Notify', src, `You received your salary of $${amount / 2}`);
    }
});*/

onNet('MRCore:Server:TriggerCallback', async (name, ...args) => {
    const src = global.source;
    try {
        MRCore.Functions.TriggerCallback(name, src, function (...args) {
            emitNet("MRCore:Client:TriggerCallback", src, name, ...args);
        }, ...args);
    } catch (error) {
        console.log('Error In Callback Trigger: ' + name + ' Error: ' + error);
    }
});

onNet('MRCore:server:STCResponse', (cbId, result) => {
    if (!MRCore.STCCallbacks[cbId]) return;
    MRCore.STCCallbacks[cbId](result);
    delete MRCore.STCCallbacks[cbId];
});

MRCore.Functions.CreateCallback('MRCore:Server:CheaterDetected', (source, cb, reason) => {
    MRCore.Player.CheatDetected(source, reason);
    cb(true);
});

onNet('chatMessage', (source, name, message) => {
    if (message.substring(0, 1) === '/') {
        const args = message.substring(1).split(' ');

        const command = args.shift().toLowerCase();

        CancelEvent();

        if (!MRCore.Commands.List[command]) return;

        const player = MRCore.Functions.GetPlayer(parseInt(source));

        if (!player) return emitNet('chatMessage', source, "SYSTEM", "error", "Access Denied");

        const HasPermission = MRCore.Functions.HasPermission(source, 'root') || MRCore.Functions.HasPermission(source, MRCore.Commands.List[command].permission);

        if (!HasPermission) return emitNet('chatMessage', source, "SYSTEM", "error", "Access Denied");

        if (MRCore.Commands.List[command].argsrequired && MRCore.Commands.List[command].arguments.length !== 0 && args[MRCore.Commands.List[command].arguments.length - 1] === undefined) {
            emitNet('chatMessage', source, "SYSTEM", "error", "All arguments must be completed!");
        } else {
            MRCore.Commands.List[command].callback(source, args);
        }
    }
});

/*onNet('MRCore:CallCommand', (command, args) => {
    console.log('Called MRCore:CallCommand', command, args)
    const source = global.source;
    if (!MRCore.Commands.List[command]) return emitNet('MRCore:Notify', global.source, 'Command does not exist!');
    const player = MRCore.Functions.GetPlayer(parseInt(source));
    if (!player) return emitNet('MRCore:Notify', source, 'You are not logged in!');
    const HasPermission = MRCore.Functions.HasPermission(source, 'root') || MRCore.Functions.HasPermission(source, MRCore.Commands.List[command].permission);
    if (!HasPermission) return emitNet('chatMessage', source, "SYSTEM", "error", "Access Denied");
    if (MRCore.Commands.List[command].argsrequired && MRCore.Commands.List[command].arguments.length > 0 && !args[MRCore.Commands.List[command].arguments.length - 1]) {
        emitNet('chatMessage', source, "SYSTEM", "error", "All arguments must be completed!");
        let agus = '';
        MRCore.Commands.List[command].arguments.map((arg) => {
            agus = agus + " [" + arg.name + "]";
        });
        emitNet('chatMessage', source, `/${command}`, false, agus)
    } else {
        MRCore.Commands.List[command].callback(source, args);
    }
});*/

console.log('Events Initialized')