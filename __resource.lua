resource_manifest_version '44febabe-d386-4d18-afbe-5e627f4af937'

dependency 'yarn'


client_scripts {
	"shared.js",
	"client/main.js",
	"client/functions.js",
	"client/events.js",
	'client/Client_SCS.js',
	'client/CBlistener.js',
	'client/Standalone/*.js',
	--"client/loops.lua",
}

server_scripts {
	"config.js",
	"shared.js",
	"main.js",
	"server/functions.js",
	"server/player.js",
	"server/events.js",
	"server/commands.js",
	'server/LuaExports.lua',
	'server/Server_SCS.js',
}

server_exports {
	'GetAllPlayers'
}