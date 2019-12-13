const {
    perms,
    normal,
    error
} = require('../../utils');
const {
    getCurrentQueue
} = require('../../Musik');
const moment = require('moment');

module.exports = {
    name: 'nowplaying',
    description: 'Zeigt was gerade gespielt wird',
    aliases: ['np'],
    args: false,
    usage: '',
    cooldown: 1,
    guildOnly: true,
    perms: perms.USER,
    async execute(bot, msg, args) {
        let queue = getCurrentQueue(bot.audioQueue, msg.guild.id);
        const player = bot.player.get(msg.guild.id);
        if (!player) return msg.channel.send(error(bot, msg).setDescription('Es wird nichts abgespielt.'));
        if (queue.length === 0) return msg.channel.send(error(bot, msg).setDescription('Es wird nichts abgespielt.'));
        let duration = moment.duration({
            ms: queue[0].info.duration
        });
        let progression = moment.duration({
            ms: player.state.position * 1000
        });
        let progressBar = ['▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬'];
        let calcul = Math.round(progressBar.length * ((progression / 1000 / 1000) / (duration / 1000)));
        progressBar[calcul] = '🔘';

        return msg.channel.send(normal(bot, msg).setTitle('Spiele jetzt:')
            .setDescription(
                '[' + queue[0].info.title + '](' + queue[0].info.url + ')\n' +
                '[`' + moment(progression / 1000).minutes() + ':' + moment(progression / 1000).seconds() + '`] ' + progressBar.join('') + ' [`' + duration.minutes() + ':' + duration.seconds() + '`]',
            ))
    }
}