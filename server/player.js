onNet('choy-spawn:server:playerNetworkReady', () => {
	const src = global.source;
	const Players = MRCore.ConnectedPlayers;
	const tokenNums = GetNumPlayerTokens(src);
	const PlayerTokens = [];
	for (let i = 0; i < tokenNums; i++) {
		const token = GetPlayerToken(src, i);
		PlayerTokens.push(token);
	}
	const Player = Object.keys(Players).some(playerID => PlayerTokens.some(token => Players[playerID] === token));
	if (Player) return DropPlayer(Player, 'We have detected that you are already connected to the server. If you believe this is an error please contact support.');
	return MRCore.ConnectedPlayers[src] = PlayerTokens;
});

MRCore.Player.Login = async function (source, citizenid) {
	//console.log('Received Login Request Source:', source);
	if (!source) return [false, 'We could not find your source. Please try again.'];
	if (!citizenid) return [false, 'Invalid Authentication. Please try again or contact support.'];
	const QueryPlayer = await MRCore.Functions.findByFilter('players', { citizenid });
	if (!QueryPlayer || QueryPlayer.length <= 0) return [false, 'We could not find your character. Please try again.'];
	const PlayerData = await MRCore.Player.initPlayerData(source, QueryPlayer[0]);
	return PlayerData;
};

MRCore.Player.CreateCharacter = async function (source, charInfo) {
	const PlayerData = await MRCore.Player.initPlayerData(source, charInfo);
	return PlayerData;
}

MRCore.Player.initPlayerData = async function (source, PlayerData) {
	const PlayerPed = GetPlayerPed(source);
	const PlayerPos = GetEntityCoords(PlayerPed);
	const PlayerHeading = GetEntityHeading(PlayerPed);

	PlayerData = PlayerData || {};

	PlayerData.source = source;
	PlayerData.id = PlayerData.id || uuidv4();
	PlayerData.citizenid = PlayerData.citizenid || await MRCore.Player.CreateCitizenId();
	PlayerData.license = PlayerData.license || MRCore.Functions.GetIdentifier(source, "license:");
	PlayerData.discord = PlayerData.discord || MRCore.Functions.GetIdentifier(source, "discord:");
	PlayerData.discordInfo = MRCore.Functions.GetPlayerDiscordInfo(PlayerData.discord);
	PlayerData.permission = PlayerData.permission || 'user';
	PlayerData.isvip = await MRCore.Functions.isVIP(source);

	PlayerData.tokens = MRCore.Functions.GetPlayerTokens(source);

	PlayerData.name = GetPlayerName(source);

	PlayerData.money = PlayerData.money || {};

	Object.keys(MRCore.Config.Money.MoneyTypes).forEach((moneytype) => {
		PlayerData.money[moneytype] = moneytype in PlayerData.money ? PlayerData.money[moneytype] : MRCore.Config.Money.MoneyTypes[moneytype];
	});

	PlayerData.charinfo = PlayerData.charinfo || {};
	PlayerData.charinfo.firstname = PlayerData.charinfo.firstname || "Firstname";
	PlayerData.charinfo.lastname = PlayerData.charinfo.lastname || "Lastname";
	PlayerData.charinfo.birthdate = PlayerData.charinfo.birthdate || "00-00-0000";
	PlayerData.charinfo.gender = PlayerData.charinfo.gender || 'male';
	PlayerData.charinfo.nationality = PlayerData.charinfo.nationality || "USA";
	PlayerData.charinfo.story = PlayerData.charinfo.story || "No story provided";

	PlayerData.healthState = PlayerData.healthState || {};
	PlayerData.healthState.isDead = PlayerData.healthState.isDead || false;
	PlayerData.healthState.isInjured = PlayerData.healthState.isInjured || false;
	PlayerData.healthState.baseStateHP = PlayerData.healthState.baseStateHP || MRConfig.Player.DefaultHealthStateHP;
	PlayerData.healthState.stateHP = PlayerData.healthState.stateHP || PlayerData.healthState.baseStateHP;
	PlayerData.healthState.maxHP = PlayerData.healthState.maxHP || GetEntityMaxHealth(PlayerPed);
	PlayerData.healthState.currentHP = PlayerData.healthState.currentHP || PlayerData.healthState.maxHP;

	PlayerData.metadata = PlayerData.metadata || {};

	PlayerData.metadata["hunger"] = PlayerData.metadata.hasOwnProperty('hunger') ? parseInt(PlayerData.metadata.hunger) : 100;
	PlayerData.metadata["thirst"] = PlayerData.metadata.hasOwnProperty('thirst') ? parseInt(PlayerData.metadata.thirst) : 100;
	PlayerData.metadata["stress"] = PlayerData.metadata.hasOwnProperty('stress') ? parseInt(PlayerData.metadata.stress) : 0;

	PlayerData.metadata["PhoneNumber"] = null;

	PlayerData.metadata["ishandcuffed"] = PlayerData.metadata.hasOwnProperty('ishandcuffed') ? PlayerData.metadata.ishandcuffed : false;

	PlayerData.metadata["bloodtype"] = PlayerData.metadata["bloodtype"] || MRCore.Config.Player.Bloodtypes[Math.floor(Math.random() * MRCore.Config.Player.Bloodtypes.length)];

	PlayerData.metadata["craftingrep"] = PlayerData.metadata["craftingrep"] || 0;

	PlayerData.metadata['walkstyle'] = PlayerData.metadata['walkstyle'] || null;

	PlayerData.metadata["fingerprint"] = PlayerData.metadata["fingerprint"] || MRCore.Player.CreateFingerId();

	PlayerData.metadata["walletid"] = PlayerData.metadata["walletid"] || MRCore.Player.CreateWalletId();

	PlayerData.metadata["instagramuid"] = PlayerData.metadata["instagramuid"] || uuidv4();

	PlayerData.metadata['email'] = PlayerData.metadata['email'] || await MRCore.Player.CreateEmail(PlayerData.charinfo.firstname, PlayerData.citizenid, PlayerData.charinfo.lastname);

	PlayerData.metadata["licences"] = PlayerData.metadata["licences"] || {
		["driver"]: false,
		["weapons"]: false
	};

	PlayerData.job = PlayerData.job || {};
	PlayerData.job.name = PlayerData.job.name || 'unemployed';
	PlayerData.job.label = PlayerData.job.label || MRShared.Jobs[PlayerData.job.name]['label'];
	PlayerData.job.payment = PlayerData.job.payment || MRShared.Jobs[PlayerData.job.name]['defaultPayment'];
	PlayerData.job.onduty = PlayerData.job.onduty || MRShared.Jobs[PlayerData.job.name]['defaultDuty'];
	PlayerData.job.isboss = PlayerData.job.isboss || false;

	if (PlayerData.job.grade) {
		PlayerData.job.grade.name = PlayerData.job.grade.name || 'no_grade';
		PlayerData.job.grade.label = PlayerData.job.grade.label || 'No Grade';
		if (MRConfig.Player.EmergencyJobs.includes(PlayerData.job.name)) {
			PlayerData.job.callsign = PlayerData.job.callsign || Math.floor(Math.random() * 9999);
			PlayerData.job.unit = PlayerData.job.unit || 0;
		}
	}

	PlayerData.position = PlayerData.position || { x: PlayerPos[0], y: PlayerPos[1], z: PlayerPos[2], h: PlayerHeading };
	PlayerData.LoggedIn = true;
	PlayerData.created_at = PlayerData.created_at || Date.now();
	PlayerData.lastLogin = Date.now();
	PlayerData.playTime = PlayerData.playTime || 0;

	PlayerData.inventory = PlayerData.inventory || [];

	return await MRCore.Player.InitPlayerFunc(PlayerData);
}

MRCore.Player.InitPlayerFunc = async function (PlayerData = {}) {
	const self = { Functions: {}, PlayerData };

	self.Functions.SetJob = function (jobname, grade_name) {
		if (typeof jobname !== 'string' || !jobname || jobname.length <= 1) return [false, 'Invalid job name'];

		const job = jobname.toLowerCase();

		if (!MRCore.Shared.Jobs.hasOwnProperty(job)) return [false, 'Invalid job name'];

		let grade = grade_name ? grade_name.toLowerCase() : null;

		if (!grade) {
			const jobGrades = MRCore.Shared.Jobs[job].grades;
			if (jobGrades) {
				const firstGrade = Object.keys(jobGrades)[0];
				grade = firstGrade ? firstGrade.toLowerCase() : null;
			}
		}

		if (grade && MRCore.Shared.Jobs[job].grades && !MRCore.Shared.Jobs[job].grades.hasOwnProperty(grade)) return [false, 'Invalid job grade'];
		
		self.PlayerData.job.name = job;
		self.PlayerData.job.label = MRCore.Shared.Jobs[job].label;
		self.PlayerData.job.onduty = MRCore.Shared.Jobs[job].defaultDuty;
		self.PlayerData.job.dutytime = MRCore.Shared.Jobs[job].defaultDuty ? Date.now() : 0;
		self.PlayerData.job.totaldutytime = 0;

		if (grade && MRCore.Shared.Jobs[job].grades) {
			const jobgrade = MRCore.Shared.Jobs[job].grades[grade];
			self.PlayerData.job.grade = {};
			self.PlayerData.job.grade.name = grade;
			self.PlayerData.job.grade.label = jobgrade.name;
			self.PlayerData.job.payment = jobgrade.payment || MRCore.Shared.Jobs[job].defaultPayment || 30;
			self.PlayerData.job.isboss = jobgrade.isboss || false;
		} else {
			delete self.PlayerData.job.grade;
			self.PlayerData.job.payment = MRCore.Shared.Jobs[job].defaultPayment || 30;
			self.PlayerData.job.isboss = false;
		}

		if (MRCore.Config.Player.EmergencyJobs.includes(job)) {
			self.PlayerData.job.callsign = Math.floor(Math.random() * 9999);
			self.PlayerData.job.unit = 0;
		} else {
			self.PlayerData.job.callsign = 0;
			self.PlayerData.job.unit = 0;
		}

		Player(self.PlayerData.source).state.set('PlayerData', self.PlayerData, true);

		return [true, 'Job updated successfully', self.PlayerData.job];
	}

	self.Functions.SetBoss = (state) => {
		self.PlayerData.job.isboss = state;
		Player(self.PlayerData.source).state.set('PlayerData', self.PlayerData, true);
	}

	self.Functions.SetJobDuty = (onDuty = false) => {
		if (typeof onDuty !== 'boolean') return;
		if (onDuty) {
			self.PlayerData.job.dutytime = Date.now();
		} else {
			const DutyDuration = Date.now() - self.PlayerData.job.dutytime;
			self.PlayerData.job.totaldutytime = (self.PlayerData.job.totaldutytime || 0) + DutyDuration;
			self.PlayerData.job.dutytime = 0;
		}
		self.PlayerData.job.onduty = onDuty;
		Player(self.PlayerData.source).state.set('PlayerData', self.PlayerData, true);
	}

	self.Functions.SetJobUnit = (unit = 0) => {
		self.PlayerData.job.unit = unit;
		Player(self.PlayerData.source).state.set('PlayerData', self.PlayerData, true);
	}

	self.Functions.SetJobCallsign = (CL = null) => {
		const callsign = CL || Math.floor(Math.random() * 9999);
		self.PlayerData.job.callsign = callsign;
		Player(self.PlayerData.source).state.set('PlayerData', self.PlayerData, true);
	}

	self.Functions.SetMetaData = (meta, val) => {
		self.PlayerData.metadata[meta] = val;
		Player(self.PlayerData.source).state.set('PlayerData', self.PlayerData, true);
	}

	self.Functions.setPhoneNumber = (number) => {
		self.PlayerData.metadata["PhoneNumber"] = number;
		Player(self.PlayerData.source).state.set('PlayerData', self.PlayerData, true);
	}

	self.Functions.SetPermission = (perm) => {
		self.PlayerData.permission = perm;
		Player(self.PlayerData.source).state.set('PlayerData', self.PlayerData, true);
	}

	self.Functions.SetPlayerPosition = (coords) => self.PlayerData.position = coords;

	self.Functions.AddMoney = (moneytype = 'cash', amt = 0, type = 'payment', TransactionTitle = 'Transaction', TransactionNote = 'No note provided') => {
		const citizenid = self.PlayerData.citizenid;
		const walletid = self.PlayerData.metadata.walletid;
		const TransactionAmount = parseInt(amt);
		const ValidTransactions = ['transfer', 'shopping', 'payment'];

		if (isNaN(TransactionAmount) || TransactionAmount <= 0) return [false, 'Amount must be a positive number'];

		if (!self.PlayerData.money[moneytype]) return [false, 'Invalid money type'];

		if (!type || !ValidTransactions.includes(type)) return [false, 'Invalid transaction type'];

		const PlayerMoney = parseInt(self.PlayerData.money[moneytype]);

		const NewAmount = Math.round(PlayerMoney + TransactionAmount);

		self.PlayerData.money[moneytype] = NewAmount;

		Player(self.PlayerData.source).state.set('PlayerData', self.PlayerData, true);

		if (moneytype === 'bank') {
			const NotifyObject = {
				id: Math.floor(Math.random() * 1000000),
				title: 'Bank',
				message: `You have received $${TransactionAmount}`,
				image: 'wallet',
				delay: 5000,
			}

			emitNet('choy-phone:client:PhoneNotification', self.PlayerData.source, NotifyObject);

			MRCore.Functions.insertRecord('bank_transactions', {
				citizenid,
				walletid,
				type: 'in',
				source: type,
				title: TransactionTitle,
				amount: TransactionAmount,
				note: TransactionNote
			})
		}

		return [true, 'Transaction completed successfully'];
	}

	self.Functions.RemoveMoney = function (moneytype, amount, type = 'payment', title = 'Transaction', note = 'No note provided') {
		const citizenid = self.PlayerData.citizenid;
		const walletid = self.PlayerData.metadata.walletid;
		const TransactionAmount = parseInt(amount);
		const ValidTransactions = ['transfer', 'shopping', 'payment'];
		const TransactionTitle = title;
		const TransactionNote = note;

		if (isNaN(TransactionAmount) || TransactionAmount <= 0) return [false, 'Transaction amount must be a positive number'];

		if (!self.PlayerData.money[moneytype]) return [false, 'We do not accept this payment method'];

		const PlayerMoney = parseInt(self.PlayerData.money[moneytype]);

		const RestAmount = Math.round(PlayerMoney - TransactionAmount);

		if (RestAmount < 0) return [false, 'You do not have enough money to complete this transaction'];

		self.PlayerData.money[moneytype] = RestAmount;

		Player(self.PlayerData.source).state.set('PlayerData', self.PlayerData, true);

		//if (moneytype === 'cash') emitNet('MRCore:Notify', self.PlayerData.source, `You've paid $${TransactionAmount}`, 'success');

		if (moneytype === 'bank' && ValidTransactions.includes(type)) {
			const NotifyObject = {
				id: Math.floor(Math.random() * 1000000),
				title: 'Bank',
				message: `You've paid $${TransactionAmount}`,
				image: 'wallet',
				delay: 5000,
			}

			emitNet('choy-phone:client:PhoneNotification', self.PlayerData.source, NotifyObject);

			MRCore.Functions.insertRecord('bank_transactions', {
				citizenid,
				walletid,
				type: 'out',
				source: type,
				title: TransactionTitle,
				amount: TransactionAmount,
				note: TransactionNote
			})
		}

		return [true, 'Transaction completed successfully'];
	};

	self.Functions.SetMoney = function (moneytype, amt) {
		const amount = parseInt(amt);
		if (isNaN(amount) || amount < 0) return [false, 'Amount must be a positive number'];
		if (!MRCore.Config.Money.MoneyTypes.hasOwnProperty(moneytype)) return [false, 'Wrong money type'];
		self.PlayerData.money[moneytype] = amount;
		Player(self.PlayerData.source).state.set('PlayerData', self.PlayerData, true);
		return [true, ''];
	};

	self.Functions.GetMoney = function (moneytype) {
		if (!MRCore.Config.Money.MoneyTypes.hasOwnProperty(moneytype)) return 0;
		return self.PlayerData.money[moneytype];
	}

	self.Functions.GetCitizenID = () => self.PlayerData.citizenid

	self.Functions.SetInventory = (ItemData = []) => {
		self.PlayerData.inventory = ItemData;
		emitNet('inventory_v2:client:updateSelfInventory', self.PlayerData.source, self.PlayerData.inventory);
		emitNet('inventory_v2:client:refreshOtherPlayerInventory', -1, { PlayerID: self.PlayerData.source, PlayerInventory: self.PlayerData.inventory });
		Player(self.PlayerData.source).state.set('PlayerData', self.PlayerData, true);
	}

	self.Functions.ClearInventory = () => {
		self.PlayerData.inventory = [];
		Player(self.PlayerData.source).state.set('PlayerData', self.PlayerData, true);
	}

	self.Functions.InventoryLoaded = () => {
		const PlayerInventory = self.PlayerData.inventory;
		const Phone = PlayerInventory.find((item) => item.slot === 21);
		self.Functions.setPhoneNumber(Phone ? Phone.PhoneNumber : null);
	}

	self.Functions.GetItemByName = (ItemName = '') => {
		const Pocket = self.PlayerData.inventory.find(item => item.spawn_name === ItemName);
		if (Pocket) return { InventoryType: 'pocket', Item: Pocket };
		const BackPackInventory = self.PlayerData.inventory.find(item => item.slot === 20);
		if (!BackPackInventory || !BackPackInventory.hasOwnProperty('items')) return null;
		const BackPack = BackPackInventory.items.find(item => item.spawn_name === ItemName);
		return BackPack ? { InventoryType: 'backpack', Item: BackPack } : null;
	}

	self.Functions.GetItemsByName = (ItemName = '') => {
		const Pocket = self.PlayerData.inventory.filter(item => item.spawn_name === ItemName);
		const BackPackInventory = self.PlayerData.inventory.find(item => item.slot === 20);
		if (!BackPackInventory || !BackPackInventory.hasOwnProperty('items')) return Pocket;
		const BackPack = BackPackInventory.items.filter(item => item.spawn_name === ItemName);
		return Pocket.concat(BackPack);
	}

	self.Functions.GetItemByID = (ItemID = '') => {
		const PlayerInventory = self.PlayerData.inventory;
		const PocketIndex = PlayerInventory.findIndex(item => item.id === ItemID);
		if (PocketIndex !== -1) return { InventoryType: 'pocket', Item: PlayerInventory[PocketIndex], Index: PocketIndex };
		const BackPackInventory = PlayerInventory.find(item => item.slot === 20);
		if (!BackPackInventory || !BackPackInventory.hasOwnProperty('items')) return null;
		const BackPackIndex = BackPackInventory.items.findIndex(item => item.id === ItemID);
		if (BackPackIndex !== -1) return { InventoryType: 'backpack', Item: BackPackInventory[BackPackIndex], Index: BackPackIndex };
		return null;
	}

	self.Functions.UpdateItem = function (ItemID = '', NewItemData = {}) {
		const Item = self.Functions.GetItemByID(ItemID);
		if (!Item) return false;
		const InventoryType = Item.InventoryType;
		if (InventoryType === 'pocket') {
			self.PlayerData.inventory[Item.Index] = NewItemData;
		} else if (InventoryType === 'backpack') {
			const BackPackInventory = self.PlayerData.inventory.find(item => item.slot === 20);
			BackPackInventory.items[Item.Index] = NewItemData;
		}

		emitNet('inventory_v2:client:updateSelfInventory', self.PlayerData.source, self.PlayerData.inventory);
		emitNet('inventory_v2:client:refreshOtherPlayerInventory', -1, { PlayerID: self.PlayerData.source, PlayerInventory: self.PlayerData.inventory });
		Player(self.PlayerData.source).state.set('PlayerData', self.PlayerData, true);

		return true;
	}

	/*self.Functions.RemoveItemByID = function (ItemID = '') {
		const Item = self.Functions.GetItemByID(ItemID);
		if (!Item) return false;
		const InventoryType = Item.InventoryType;
		if (InventoryType === 'pocket') {
			self.PlayerData.inventory.splice(Item.Index, 1);
		} else if (InventoryType === 'backpack') {
			const BackPackInventory = self.PlayerData.inventory.find(item => item.slot === 20);
			BackPackInventory.items.splice(Item.Index, 1);
		}

		emitNet('inventory_v2:client:updateSelfInventory', self.PlayerData.source, self.PlayerData.inventory);
		emitNet('inventory_v2:client:refreshOtherPlayerInventory', -1, { PlayerID: self.PlayerData.source, PlayerInventory: self.PlayerData.inventory });
		Player(self.PlayerData.source).state.set('PlayerData', self.PlayerData, true);

		return true;
	}*/

	self.Functions.RemoveItemByID = function (ItemID = '', amount = 1) {
		const Item = self.Functions.GetItemByID(ItemID);
		if (!Item) return false;
		const InventoryType = Item.InventoryType;
		if (InventoryType === 'pocket') {
			const ItemAmount = parseInt(Item.Item.amount);
			if (ItemAmount <= amount) {
				self.PlayerData.inventory.splice(Item.Index, 1);
			} else {
				self.PlayerData.inventory[Item.Index].amount -= amount;
			}
		} else if (InventoryType === 'backpack') {
			const BackPackInventory = self.PlayerData.inventory.find(item => item.slot === 20);
			const BackPackItem = BackPackInventory.items[Item.Index];
			const ItemAmount = parseInt(BackPackItem.amount);
			if (ItemAmount <= amount) {
				BackPackInventory.items.splice(Item.Index, 1);
			} else {
				BackPackInventory.items[Item.Index].amount -= amount;
			}
		}
		emitNet('inventory_v2:client:updateSelfInventory', self.PlayerData.source, self.PlayerData.inventory);
		emitNet('inventory_v2:client:refreshOtherPlayerInventory', -1, { PlayerID: self.PlayerData.source, PlayerInventory: self.PlayerData.inventory });
		Player(self.PlayerData.source).state.set('PlayerData', self.PlayerData, true);
		return true;
	}

	self.Functions.RemoveItemByName = function (ItemName = '', amount = 1) {
		const Item = self.Functions.GetItemByName(ItemName);
		if (!Item) return false;
		const InventoryType = Item.InventoryType;
		if (InventoryType === 'pocket') {
			const ItemAmount = parseInt(Item.Item.amount);
			if (ItemAmount <= amount) {
				self.PlayerData.inventory.splice(Item.Index, 1);
			} else {
				self.PlayerData.inventory[Item.Index].amount -= amount;
			}
		} else if (InventoryType === 'backpack') {
			const BackPackInventory = self.PlayerData.inventory.find(item => item.slot === 20);
			const BackPackItem = BackPackInventory.items[Item.Index];
			const ItemAmount = parseInt(BackPackItem.amount);
			if (ItemAmount <= amount) {
				BackPackInventory.items.splice(Item.Index, 1);
			} else {
				BackPackInventory.items[Item.Index].amount -= amount;
			}
		}
		emitNet('inventory_v2:client:updateSelfInventory', self.PlayerData.source, self.PlayerData.inventory);
		emitNet('inventory_v2:client:refreshOtherPlayerInventory', -1, { PlayerID: self.PlayerData.source, PlayerInventory: self.PlayerData.inventory });
		Player(self.PlayerData.source).state.set('PlayerData', self.PlayerData, true);
		return true;
	}

	self.Functions.Save = (reason = 'Player left') => MRCore.Player.Save(self.PlayerData.source, reason);

	MRCore.Players[self.PlayerData.source] = self;

	MRCore.Commands.Refresh(self.PlayerData.source);

	MRCore.Functions.ConsoleLog(`[MRCore]: Loaded Player Data For ${self.PlayerData.name} (${self.PlayerData.citizenid})`);

	Player(self.PlayerData.source).state.set('PlayerData', self.PlayerData, true);

	return [true, MRCore.Players[self.PlayerData.source]];
}

MRCore.Player.Save = async function (source, reason = 'Player left') {
	const PlayerName = GetPlayerName(source);

	try {
		const Player = MRCore.Players[source];

		if (!Player) {
			MRCore.Functions.ConsoleLog(`[MRCore]: Can't Save Player [${PlayerName}] Not Logged In. Leave Reason: ${reason}`, true);
			return [false, 'You are already offline'];
		}

		const PlayerData = Player.PlayerData ? Player.PlayerData : {};

		if (Object.keys(PlayerData).length <= 0) {
			delete MRCore.Players[source];
			MRCore.Functions.ConsoleLog(`[MRCore]: Can't Save Player [${PlayerName}] Not Logged In. Leave Reason: ${reason}`, true);
			return [false, 'You are already offline'];
		}

		const PlayerState = GetStateBagValue(`player:${source}`, 'isLoggedIn');

		if (!PlayerState) {
			delete MRCore.Players[source];
			MRCore.Functions.ConsoleLog(`[MRCore]: Can't Save Player [${PlayerName}] Not Logged In. Leave Reason: ${reason}`, true);
			return [false, 'You are already offline'];
		}

		const PlayerPed = GetPlayerPed(source);
		const PlayerCoords = GetEntityCoords(PlayerPed);
		const PlayerHeading = GetEntityHeading(PlayerPed);
		const PlayerHealth = GetEntityHealth(PlayerPed);
		const currentTime = Date.now();

		PlayerData.position = { x: PlayerCoords[0], y: PlayerCoords[1], z: PlayerCoords[2], h: PlayerHeading };
		PlayerData.healthState.currentHP = PlayerHealth;
		PlayerData.LoggedIn = false;
		PlayerData.playTime += currentTime - PlayerData.lastLogin;
		PlayerData.job.onduty = false;
		PlayerData.job.totaldutytime = (PlayerData.job?.totaldutytime || 0) + (currentTime - (PlayerData.job?.dutytime || currentTime));
		PlayerData.job.dutytime = 0;

		delete PlayerData.source;

		delete MRCore.Players[source];

		const DBPlayer = await MRCore.Functions.findByID('players', PlayerData.id);

		if (DBPlayer.length > 0) {
			const updateResp = await MRCore.Functions.replaceRecord('players', PlayerData.id, PlayerData);
			if (!updateResp) {
				MRCore.Functions.ConsoleLog(`[MRCore]: Can't Save Player [${Player.PlayerData.name}] (${Player.PlayerData.citizenid}) Data (DB Update Error). Leave Reason: ${reason}`, true);
				return [false, 'An error occurred while saving your data'];
			}
		} else {
			const insertResp = await MRCore.Functions.insertRecord('players', PlayerData);
			if (insertResp.inserted !== 1) {
				MRCore.Functions.ConsoleLog(`[MRCore]: Can't Save Player [${Player.PlayerData.name}] (${Player.PlayerData.citizenid}) Data (DB Insert Error). Leave Reason: ${reason}`, true);
				return [false, 'An error occurred while saving your data'];
			}
		}

		MRCore.Functions.SendInventoryLog(`Saved [${Player.PlayerData.name}] Inventory CitizenID: ${Player.PlayerData.citizenid}`, Player.PlayerData.inventory);

		MRCore.Functions.ConsoleLog(`[MRCore]: Saved Player [${Player.PlayerData.name}] (${Player.PlayerData.citizenid}) Data. Leave Reason: ${reason}`);

		return [true, 'You have been logged out'];
	} catch (err) {
		MRCore.Functions.ConsoleLog(`[MRCore]: Can't Save Player [${PlayerName}] Data (IN DB). Leave Reason: ${reason}`, true);
		console.log('Save Error:', err);
		return [false, 'An error occurred while saving your data'];
	}
};

MRCore.Player.Logout = async function (playerID) {
	try {
		const source = parseInt(playerID);
		const [success, resp] = await MRCore.Player.Save(source, 'Player logged out');
		if (success) {
			Player(source).state.set('isLoggedIn', false, true);
			Player(source).state.set('PlayerData', {}, true);
		}
		return [success, resp];
	} catch (err) {
		console.log('Logout Error:', err);
		return [false, 'An error occurred while logging out'];
	}
}

MRCore.Player.CheatDetected = async (source, reason = 'No reason provided') => {
	console.log(`^1[Anticheat] ^8Cheater Detected: Player ID: ${source} Reason: ${reason}^7`);
}

on('MRCore:Player:Logout', async (source) => {
	const src = parseInt(source);
	console.log('Received Logout Event for Source:', src);
	if (isNaN(src) || src <= 0) return;
	const [success, resp] = await MRCore.Player.Logout(src);
	emitNet('MRCore:Notify', src, resp, success ? 'success' : 'error');
});

MRCore.Player.DeleteCharacter = function (source, citizenid) {
	//
}

function GenerateCitizenId() {
	const RandStr = MRCore.Functions.RandomString(2);
	const RandInt = MRCore.Functions.RandomInt(4);
	const CitizenID = `${RandStr}${RandInt}`.toUpperCase();
	return CitizenID;
}

MRCore.Player.CreateCitizenId = async function () {
	let citizenid;
	let exist = true;

	while (exist) {
		citizenid = GenerateCitizenId();
		const Query = await MRCore.Functions.findByFilter('players', { citizenid });
		exist = Query && Query.length > 0;
		await MRCore.Functions.sleep(100);
	}

	return citizenid;
}

MRCore.Player.CreateFingerId = function () {
	const CurrentTime = Date.now().toString();
	const RandStr = MRCore.Functions.RandomString(5);
	const FingerID = RandStr.split('').map((char, index) => char + (CurrentTime.substring(index * 2, (index + 1) * 2) || '')).join('');
	return FingerID.toUpperCase();
}

MRCore.Player.CreateWalletId = function () {
	const CurrentTime = Date.now().toString();
	const WalletId = "MRP-" + CurrentTime;
	return WalletId;
}

MRCore.Player.CreateEmail = async function (firstname = '', citizenid = '', lastname = '') {
	let email = '';
	let exist = true;
	const mergedEmail = `${firstname.toLowerCase()}${citizenid.toLowerCase()}${lastname.toLowerCase()}`;
	const shortenedEmail = mergedEmail.substring(0, Math.min(mergedEmail.length, 10));
	while (exist) {
		const randomNum = MRCore.Functions.MathRandom(10, 100);
		email = `${shortenedEmail}${randomNum}@marruecos.rp`;
		const Query = await MRCore.Functions.findByFilter('players', { email });
		exist = Query && Query.length > 0;
		await MRCore.Functions.sleep(100);
	}
	return email;
}