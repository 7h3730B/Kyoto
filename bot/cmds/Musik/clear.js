const { perms, normal } = require('../../utils');
const { getCurrentQueue } = require('../../Musik');

module.exports = {
	name: 'clear',
	description: 'Clears die Queue',
	aliases: ['c'],
	args: false,
	usage: '[]',
    cooldown: 1,
    guildOnly: true,
	perms: perms.DJ,
    async execute(bot, msg, args) {
        let queue = getCurrentQueue(client.audioQueue, msg.guild.id);
        if (!client.player.get(msg.guild.id)) return msg.channel.send(error(bot, msg).setDescription('Es wird zurzeit nichts gespielt'));
        if (queue.length === 0) return msg.channel.send(error(bot, msg).setDescription('Es wird zurzeit nichts gespielt'));
        else if (queue.length !== 1) { queue.splice(1, queue.length); }
            msg.channel.send(normal(bot, msg).setDescription('Queue wurde gecleared'));
    }
}