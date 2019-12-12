const { error, perms, normal, list } = require('../../utils');
const { getCurrentQueue } = require('../../Musik');

module.exports = {
	name: 'queue',
	description: 'Zeigt die Queue an.',
	aliases: ['q'],
	args: false,
	usage: '[]',
    cooldown: 1,
    guildOnly: true,
	perms: perms.USER,
    async execute(bot, msg, args) {
        let queue = getCurrentQueue(client.audioQueue, msg.guild.id);
        if (!client.player.get(msg.guild.id)) return msg.channel.send(error(bot, msg).setDescription('Es wird zurzeit nichts gespielt'));
        if (queue.length === 0) return msg.channel.send(error(bot, msg).setDescription('Es wird zurzeit nichts gespielt'));
        list('Queue:', queue, 1, 15, bot, msg, null, 0);
    }
}