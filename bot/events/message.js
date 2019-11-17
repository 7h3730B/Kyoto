const { Collection } = require('discord.js');
const config = require('../config');

module.exports = async (client, message) => {

	if (!message.guild) return;

	let prefix = config.prefix;
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	let args = message.content.slice(prefix.length).split(/ +/);
	let commandName = args.shift().toLowerCase();

	let command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (command.guildOnly && message.channel.type !== 'text') {
		return message.reply('Nur auf Servern');
	}

	if (command.args && !args.length) {
		let reply = `Du brauchst mehr Argumente, ${message.author}!`;

		if (command.usage) {
			reply += `\nDu solltest den Command so nutzen: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.reply(reply);
	}

	if (!client.cooldown.has(command.name)) {
		client.cooldown.set(command.name, new Collection());
	}

	let now = Date.now();
	let timestamps = client.cooldown.get(command.name);
	let cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id && message.author.id != config.ownerid)) {
		let expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			let timeLeft = (expirationTime - now) / 1000;
			return message.reply(`Bitte warte noch: ${timeLeft.toFixed(1)} Sekunde(n) bis du \`${command.name}\` wieder benutzen kannst.`);
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	try {
        command.execute(client, message, args);
	} catch (error) {
		logger.error(error);
		message.reply('Ein Fehler ist passiert!');
	}
};