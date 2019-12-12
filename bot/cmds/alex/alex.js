const discord = require('discord.js');
const { perms, normal } = require('../../utils');

module.exports = {
	name: 'alex',
	description: 'alex ist hääftig',
	aliases: ['a'],
	args: false,
	usage: '[]',
    cooldown: 1,
    guildOnly: true,
	perms: perms.USER,
    async execute(bot, msg, args) {
        mbet = normal(bot,msg).setTitle("Alex ist hääftig").setDescription("Alex ist häääftig, Jan Stinkt, Ente ebenfalls").setColor("ff0800");
        msg.channel.send(mbet);
        
    }
}