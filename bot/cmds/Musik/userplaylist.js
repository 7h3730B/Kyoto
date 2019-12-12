const {
  perms,
  normal,
  error
} = require('../../utils');
const playlist = require('./playlist');

module.exports = {
  name: 'userplaylist',
  description: 'create - Erstellt eine Playlist\nlist - zeigt alle Playlists oder alle Songs in einer Playlist an\nadd - Fügt einen Song oder Playlist zu einer Playlist hinzu\nqueue - store speichert die aktuelle Queue in einer Playlist\nplay - Fügt eine Playlist zur Queue hinzu',
  aliases: ['upl'],
  args: true,
  usage: '[list|play|queue|add|create] [Playlist] [url|searchquery]',
  cooldown: 1,
  guildOnly: true,
  perms: perms.USER,
  async execute(bot, msg, args) {
    await playlist.execute(bot, msg, args, true);
  }
}