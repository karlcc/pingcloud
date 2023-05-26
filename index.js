const config = require('./config');
const Discord = require('discord.js');
const Monitor = require('ping-monitor');

const client = new Discord.Client();
const myWebsite = new Monitor({
	website: config.website,
	interval: config.timer,
});
let timer = config.timer;
let serverOn = false;
let lastactive = -1;

function calcTime(city, offset) {
	// create Date object for current location
	const d = new Date();

	// convert to msec
	// add local time zone offset
	// get UTC time in msec
	const utc = d.getTime() + (d.getTimezoneOffset() * 60000);

	// create new Date object for different city
	// using supplied offset
	const nd = new Date(utc + (3600000 * offset));

	// return time as a string
	// return "The local time in " + city + " is " + nd.toLocaleString();
	return nd;
}

// If there isn't a reaction for every role, scold the user!
if (config.roles.length !== config.reactions.length) throw 'Roles list and reactions list are not the same length!';

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

// Function to generate the role messages, based on your settings
function generateMessages() {
	const messages = [];
	messages.push(config.initialMessage);
	// eslint-disable-next-line no-inline-comments
	for (const role of config.roles) messages.push(`React below to send cmd **"${role}"**.`); // DONT CHANGE THIS
	return messages;
}

// this event is required to be handled in all Node-Monitor instances
// myWebsite.on('error', function(res) {
//	console.log('Error! ' + res.website + ' ' + res.statusMessage);
// });

myWebsite.on('error', function(msg) {
	console.log('Error code:' + msg.statusCode);
	serverOn = false;
	lastactive = calcTime('HK', +8).toLocaleString() + ' (HKT)';
	client.channels.get('490059781894176768').send(
		'<@488651090548752384>, ' + msg.website + ' Error: ' + msg.statusCode + ' ' + msg.statusMessage);
	// change role to server down
	const guildObj = client.guilds.get('488655255043571715');
	const roleObj = guildObj.roles.find(r => r.name === config.roles[2]);
	const initroleObj = guildObj.roles.find(r => r.name === client.user.username);
	const user = guildObj.members.get('488654184455864320');
	const role = user.roles.find(r => r.name === 'Alarm');
	guildObj.fetchMember('494187255804461076').then(member =>{
		member.setRoles([initroleObj, roleObj])
			.then(() => {
				// send refresh msg
				const messageID = client.channels.get('532039473475616768').lastMessageID;
				client.channels.get('532039473475616768').fetchMessage(messageID)
					.then(message => {
						message.delete();
						client.channels.get('532039473475616768').send(
							`<@494187255804461076> **${config.roles[2]}**, <@488654184455864320>  ${(role ? '**Alarming**' : 'Normal')}`);
					})
					.catch(() => client.channels.get('532039473475616768').send(
						`<@494187255804461076> **${config.roles[2]}**, <@488654184455864320>  ${(role ? 'Alarming' : 'Normal')}`));
			})
			.catch(console.error);
	});
});

myWebsite.on('up', function(res) {
	console.log(res.website + ' is up.');
	serverOn = true;
	lastactive = calcTime('HK', +8).toLocaleString() + ' (HKT)';
	// change role to server on
	const guildObj = client.guilds.get('488655255043571715');
	const roleObj = guildObj.roles.find(r => r.name === config.roles[3]);
	const initroleObj = guildObj.roles.find(r => r.name === client.user.username);
	const user = guildObj.members.get('488654184455864320');
	const role = user.roles.find(r => r.name === 'Alarm');
	guildObj.fetchMember('494187255804461076').then(member =>{
		member.setRoles([initroleObj, roleObj])
			.then(() => {
				// send refresh msg
				const messageID = client.channels.get('532039473475616768').lastMessageID;
				client.channels.get('532039473475616768').fetchMessage(messageID)
					.then(message => {
						message.delete();
						client.channels.get('532039473475616768').send(
							`<@494187255804461076> ${config.roles[3]}, <@488654184455864320>  ${(role ? '**Alarming**' : 'Normal')}`);
					})
					.catch(() => client.channels.get('532039473475616768').send(
						`<@494187255804461076> ${config.roles[3]}, <@488654184455864320>  ${(role ? 'Alarming' : 'Normal')}`));
			})
			.catch(console.error);
	});
});

myWebsite.on('down', function(res) {
	console.log(res.website + ' is down! ' + res.statusMessage);
	serverOn = false;
	lastactive = calcTime('HK', +8).toLocaleString() + ' (HKT)';
	client.channels.get('490059781894176768').send(
		'<@488651090548752384>, ' + res.website + ' is down! ' + res.statusMessage);
	// change role to server down
	const guildObj = client.guilds.get('488655255043571715');
	const roleObj = guildObj.roles.find(r => r.name === config.roles[2]);
	const initroleObj = guildObj.roles.find(r => r.name === client.user.username);
	const user = guildObj.members.get('488654184455864320');
	const role = user.roles.find(r => r.name === 'Alarm');
	guildObj.fetchMember('494187255804461076').then(member =>{
		member.setRoles([initroleObj, roleObj])
			.then(() => {
				// send refresh msg
				const messageID = client.channels.get('532039473475616768').lastMessageID;
				client.channels.get('532039473475616768').fetchMessage(messageID)
					.then(message => {
						message.delete();
						client.channels.get('532039473475616768').send(
							`<@494187255804461076> **${config.roles[2]}**, <@488654184455864320>  ${(role ? '**Alarming**' : 'Normal')}`);
					})
					.catch(() => client.channels.get('532039473475616768').send(
						`<@494187255804461076> **${config.roles[2]}**, <@488654184455864320>  ${(role ? 'Alarming' : 'Normal')}`));
			})
			.catch(console.error);
	});
});

client.on('message', message => {
	if (!message.content.startsWith(config.prefix)) return;
	// if (message.author.bot && !(message.author.id == '488654184455864320')) return;
	const interval = (config.timer * (60 * 1000));
	if (message.content.startsWith(`${config.prefix}ping on`)) {
		// myWebsite.interval = interval;
		myWebsite.stop();
		myWebsite.start();
		timer = config.timer;
		return	message.channel.send(
			`${myWebsite.website} monitor has started. ${config.timer} Min`);
	}
	if (message.content.startsWith(`${config.prefix}ping off`)) {
		myWebsite.stop();
		timer = -1;
		return	message.channel.send(
			`${myWebsite.website} monitor has stopped.`);
	}

	if (message.content.startsWith(`${config.prefix}pings`)) {
		return	message.channel.send(
			`${myWebsite.website} monitor: ${timer} Min\nServer is ${(serverOn ? 'on' : 'off')} at ${lastactive}`);
	}

	if (message.author.id == config.yourID && message.content.toLowerCase() == config.setupCMD) {
		const toSend = generateMessages();
		// eslint-disable-next-line no-shadow
		const mappedArray = [[toSend[0], false], ...toSend.slice(1).map((message, idx) => [message, config.reactions[idx]])];
		message.channel.send(mappedArray[0][0]);
		for (const mapObj of mappedArray.slice(1, 3)) {
			message.channel.send(mapObj[0], { code: 'asciidoc' }).then(sent => {
				if (mapObj[1]) {
					sent.react(mapObj[1]);
				}
			});
		}
	}

});

client.on('raw', event => {
	if (event.t === 'MESSAGE_REACTION_ADD' || event.t == 'MESSAGE_REACTION_REMOVE') {
		const channel = client.channels.get(event.d.channel_id);
		// eslint-disable-next-line no-unused-vars
		const message = channel.fetchMessage(event.d.message_id).then(msg=> {
			const user = msg.guild.members.get(event.d.user_id);

			if (msg.author.id == client.user.id && msg.content != config.initialMessage) {

				const re = '\\*\\*"(.+)?(?="\\*\\*)';
				const role = msg.content.match(re)[1];

				if (user.id != client.user.id) {
					// const roleObj = msg.guild.roles.find(r => r.name === role);
					// const memberObj = msg.guild.members.get(user.id);

					if (event.t === 'MESSAGE_REACTION_ADD') {
						// memberObj.addRole(roleObj);
						// console.log(role);
						if (role === config.roles[1]) {
							client.channels.get('488655255043571717').send('!ping off');
						}
						if (role === config.roles[0]) {
							client.channels.get('488655255043571717').send('!ack');
						}
					}
					else {
						// memberObj.removeRole(roleObj);
						// console.log(roleObj);
						// eslint-disable-next-line no-lonely-if
						if (role === config.roles[1]) {
							client.channels.get('488655255043571717').send('!ping on');
						}
					}
				}
			}
		});
	}
});

myWebsite.on('stop', function(website) {
	console.log(website + ' monitor has stopped.');
	client.channels.get('490059781894176768').send(
		'<@488651090548752384>, ' + website + ' monitor has stopped.');
	// change role to ping off
	const guildObj = client.guilds.get('488655255043571715');
	const roleObj = guildObj.roles.find(r => r.name === config.roles[1]);
	const initroleObj = guildObj.roles.find(r => r.name === client.user.username);
	const user = guildObj.members.get('488654184455864320');
	const role = user.roles.find(r => r.name === 'Alarm');
	guildObj.fetchMember('494187255804461076').then(member =>{
		member.setRoles([initroleObj, roleObj])
			.then(() => {
				// send refresh msg
				const messageID = client.channels.get('532039473475616768').lastMessageID;
				client.channels.get('532039473475616768').fetchMessage(messageID)
					.then(message => {
						message.delete();
						client.channels.get('532039473475616768').send(
							`<@494187255804461076> ${config.roles[1]}, <@488654184455864320>  ${(role ? '**Alarming**' : 'Normal')}`);
					})
					.catch(() => client.channels.get('532039473475616768').send(
						`<@494187255804461076> ${config.roles[1]}, <@488654184455864320>  ${(role ? 'Alarming' : 'Normal')}`));
			})
			.catch(console.error);
	});
});

client.on('error', console.error);

client.login(config.token);