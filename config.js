MRConfig = {}

MRConfig.MaxPlayers = GetConvarInt('sv_maxclients', 255);

MRConfig.IdentifierType = "license";

MRConfig.DefaultSpawn = {
    x: 1399.3091,
    y: 1164.1984,
    z: 114.3336,
    h: 181.7728
}

MRConfig.Money = {}

MRConfig.Money.MoneyTypes = {
    ['cash']: 500,
    ['bank']: 2500
}

MRConfig.Money.DontAllowMinus = ['cash', 'crypto']

MRConfig.Player = {}
MRConfig.Player.EmergencyJobs = ['police', 'sheriff']
MRConfig.Player.MaxWeight = 130000
MRConfig.Player.MaxInvSlots = 40
MRConfig.Player.Bloodtypes = [
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-",
]

MRConfig.Player.DefaultHealthStateHP = 20

MRConfig.Server = {}
MRConfig.Server.readytojoin = false;
MRConfig.Server.closed = false;
MRConfig.Server.closedReason = "Closed for testing."
MRConfig.Server.uptime = 0
MRConfig.Server.discord = "SERVER DISCORD LINK"

MRConfig.Server.AvailablePermissions = ['root', 'admin', 'spectator', 'user'];

//Logs Setup
MRConfig.Server.sendLog = false;
MRConfig.Server.Discord_Webhook_Join_Leave = 'DISCORD_WEBHOOK_URL';
MRConfig.Server.Discord_Webhokk_AntiCheat = 'DISCORD_WEBHOOK_URL';
MRConfig.Server.BannedWords = []
MRConfig.Server.DiscordWhiteListRole = '1004394551215128636';
MRConfig.Server.Discord_Not_Whitelisted_Message = 'You are not whitelisted to join the server. Please join our discord https://discord.gg/wxqz7FcChp and follow the instructions to get whitelisted.';
MRConfig.Server.DiscordUpdateTimePerMin = 5;
MRConfig.Server.DiscordMultiCharacterRole = '1005836073215209522';
MRConfig.Server.DiscordBotToken = 'DISCORD_BOT_TOKEN';