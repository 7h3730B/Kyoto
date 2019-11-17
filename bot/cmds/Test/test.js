const discord = require('discord.js');
const { perms } = require('../../utils');

module.exports = {
	name: 'Test',
	description: 'Test-command',
	aliases: ['T'],
	args: false,
	usage: '[]',
    cooldown: 5,
    guildOnly: true,
	perms: perms.USER,
    async execute(bot, msg, args) {

    }
}
