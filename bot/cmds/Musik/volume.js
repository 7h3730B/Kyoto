const {
    audioData
} = require('../../Musik.js');
const {
    perms,
    normal,
    error
} = require('../../utils');

module.exports = {
    name: 'volume',
    description: 'Setzt die Lautstärke auf einen beliebigen Wert',
    aliases: null,
    args: false,
    usage: '[volume (1-200)]',
    cooldown: 1,
    guildOnly: true,
    perms: perms.USER,
    async execute(bot, msg, args) {
        const volume = args.join(' ');
        const player = client.player.get(msg.guild.id);
        if (!player) return msg.channel.send(error(bot, msg).setDescription('Es wird zurzeit nichts abgespielt.'));
        if (!volume || isNaN(volume)) return msg.channel.send(error(bot, msg).setDescription('Keine Valide Eingabe'));
        else if (volume <= 0 || volume > 100) return msg.channel.send(error(bot, msg).setDescription('Keine Valide Eingabe'));
        try {
            let vol = await player.volume(volume);
            let progressBar = ['▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬'];
            let calcul = Math.round(progressBar.length * (vol.state.volume / 100));
            progressBar[calcul] = '🔘';
            return msg.channel.send('🔊 Setze das Volumen auf: **' + vol.state.volume + '**%.\n[`1%`] ' + progressBar.join('') + ' [`100%`]');
        } catch (exception) {
            if (exception) return msg.channel.send(error(bot, msg).setDescription('```JS\n' + exception.message + '```'));
        }
    }
}