const {
    perms,
    normal,
    error
} = require('../../utils');
const {
    getCurrentQueue
} = require('../../Musik');

module.exports = {
    name: 'skip',
    description: 'Übersprint einen Song',
    aliases: null,
    args: false,
    usage: '',
    cooldown: 1,
    guildOnly: true,
    perms: perms.DJ,
    async execute(bot, msg, args) {
        let queue = getCurrentQueue(bot.audioQueue, msg.guild.id);
        const player = client.player.get(msg.guild.id);
        if (!player) return msg.channel.send(error(bot, msg).setDescription('Nichts da zum skippen'));
        msg.channel.send(normal(bot, msg).setDescription('Überspringe einen Song'))
            .then((m) => {
                m.delete();
                msg.delete();
                try {
                    player.stop();
                } catch (exception) {
                    if (exception) return message.channel.send(error(bot, msg).setDescription('```JS\n' + exception.message + '```'));
                }
            });
    }
}