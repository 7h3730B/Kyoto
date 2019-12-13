const {
    perms,
    normal,
    error
} = require('../../utils');
const {
    addToQueue
} = require('../../Musik.js');

module.exports = {
    name: 'play',
    description: 'Spielt Musik',
    aliases: ['p'],
    args: true,
    usage: '[url|name]',
    cooldown: 1,
    guildOnly: true,
    perms: perms.DJ,
    async execute(bot, msg, args) {

        if (!msg.member.voice.channel) return msg.channel.send(error(bot, msg).setTitle("Fehler").setDescription("Du musst in einem Voice Channel sein um diesen Command nutzen zu können."));

        const player = client.player.get(msg.guild.id);
        const track = args.join(' ');
        if (!track) {
            return msg.channel.send(error(bot, msg).setDescription('Keine Valide Eingabe.'));
        }
        try {
            if (!player) {
                client.player.join({
                    guild: msg.guild.id,
                    channel: msg.member.voice.channel.id,
                    host: client.player.nodes.first().host
                }, {
                    selfdeaf: true
                });
            }
            addToQueue(client, msg, track);
        } catch (exception) {
            if (exception) {
                console.log(exception);
                return msg.channel.send(error(bot, msg).setDescription('```JS\n' + exception.message + '```'));
            }
        }
    }
}