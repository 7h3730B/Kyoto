const { Client, Collection } = require('discord.js');
const config = require('./config')
const fs = require("fs");

const client = new Client({});

global.client = client;

client.commands = new Collection();
client.cooldown = new Collection();
client.categories = [];

const cmdFolders = fs.readdirSync('./bot/cmds');
const eventFolders = fs.readdirSync('./bot/events').filter(f => f.endsWith('.js'));

for (const file of eventFolders) {
	const evte = require(`./events/${file}`);
	const evteName = file.replace('.js', '');
	logger.info(`Loaded Event ${evteName}`);
	client.on(evteName, evte.bind(null, client));
}

for (const folder of cmdFolders) {

    const fold = fs.readdirSync(`./bot/cmds/${folder}`).filter(file => file.endsWith('.js'));
    const category = folder;
    if (!client.categories.includes(category)){
        client.categories.push(category);
    }

    for(const files of fold) {
        const command = require(`./cmds/${folder}/${files}`)
        command.category = category;
		client.commands.set(command.name, command);
		logger.info(`Command: ${command.name} loaded.`);
    }
}

client.on('info', m => logger.info(m));
client.on('debug', m => logger.debug(m));
client.on('warn', m => logger.warn(m));
client.on('error', m => logger.error(m));

process.on('uncaughtException', error => client.emit('error', error));

client.login(config.token);
