const {
  perms,
  normal,
  error
} = require('../../utils');
const PlaylistSchema = require('../../models/PlaylistSchema');
const UserPlaylistSchema = require('../../models/UserPlaylistSchema');
const {
  getSongs,
  getCurrentQueue,
  play
} = require('../../Musik');
const {
  MessageCollector
} = require('discord.js');

let db = PlaylistSchema;
module.exports = {
  name: 'playlist',
  description: 'create - Erstellt eine Playlist\nlist - zeigt alle Playlists oder alle Songs in einer Playlist an\nadd - Fügt einen Song oder Playlist zu einer Playlist hinzu\nqueue - store speichert die aktuelle Queue in einer Playlist\nplay - Fügt eine Playlist zur Queue hinzu',
  aliases: ['pl'],
  args: true,
  usage: '[list|play|queue|add|create] [Playlist] [url|searchquery]',
  cooldown: 1,
  guildOnly: true,
  perms: perms.USER,
  async execute(bot, msg, args, up) {
    if (db == UserPlaylistSchema) db = PlaylistSchema;
    if (up) db = UserPlaylistSchema;
    guild_id = msg.guild.id;
    if (up) guild_id = msg.author.id;
    if (!args[0]) return;
    switch (args[0].toLowerCase()) {
      case 'play':
        if (!await get_One(guild_id, msg, args[1])) return msg.channel.send(error(bot, msg).setDescription('Playlist nicht vorhanden.'));
        let queue3 = getCurrentQueue(bot.audioQueue, msg.guild.id);
        let x = await get_One(guild_id, msg, args[1]);
        if (!msg.member.voice.channel) return msg.channel.send(error(bot, msg).setTitle("Fehler").setDescription("Du musst in einem Voice Channel sein um diesen Command nutzen zu können."));

        const player = client.player.get(msg.guild.id);
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
        } catch (exception) {
          if (exception) {
            console.log(exception);
            return msg.channel.send(error(bot, msg).setDescription('```JS\n' + exception.message + '```'));
          }
        }
        let play2 = true;
        if (queue3.length > 1) play2 = false;
        for (let i = 0; i < x.songs.length; i++) {
          queue3.push({
            track: x.songs[i].track,
            author: x.songs[i].added_by,
            loop: false,
            info: {
              identifier: x.songs[i].info.identifier,
              title: x.songs[i].info.title,
              duration: x.songs[i].info.length,
              author: x.songs[i].info.author,
              url: x.songs[i].info.uri,
              stream: x.songs[i].isStream,
              seekable: x.songs[i].info.isSeekable
            }
          });
                  // track: songs[i].track,
        //             author: message.author.tag,
        //             loop: false,
        //             info: {
        //                 identifier: songs[i].info.identifier,
        //                 title: songs[i].info.title,
        //                 duration: songs[i].info.length,
        //                 author: songs[i].info.author,
        //                 url: songs[i].info.uri,
        //                 stream: songs[i].info.isStream,
        //                 seekable: songs[i].info.isSeekable
        //             }
        }
        msg.channel.send(normal(bot, msg).setDescription('Playlist in queue gefügt'));
        if (play2) play(bot, msg);
        break;
      case 'queue':
        // track: song.track,
        // author: message.author.tag,
        // loop: false,
        // info: {
        //     identifier: song.info.identifier,
        //     title: song.info.title,
        //     duration: song.info.length,
        //     author: song.info.author,
        //     url: song.info.uri,
        //     stream: song.info.isStream,
        //     seekable: song.info.isSeekable
        // }
        if (!await get_One(guild_id, msg, args[1])) return msg.channel.send(error(bot, msg).setDescription('Playlist nicht vorhanden.'));
        let queue2 = getCurrentQueue(bot.audioQueue, msg.guild.id);
        if (!queue2 || queue2 == []) return;
        for (let i = 0; i < queue2.length; i++) {
          update(guild_id, args[1], queue2[i].info.url, queue2[i].info.title, msg.author.tag, queue2[i].info, queue2[i].track);
        }
        break;
      case 'list':
        let queue = await get(guild_id, msg);
        if (up && !args[1]) return list('Playlists von diesem User:', queue, 1, 10, client, msg, undefined, 0);
        if (!args[1]) return list('Playlists auf diesem Server:', queue, 1, 10, client, msg, undefined, 0);
        else {
          queue = await get_One(guild_id, msg, args[1]);
          if (!queue) return msg.channel.send(error(bot, msg).setDescription('Konnte diese Playlist nicht finden'));
          list('Songs in: ' + args[1], queue.songs, 1, 15, client, msg, undefined, 0)
        }
        break;

      case 'create':
        if (!args[1]) return msg.channel.send(error(bot, msg).setDescription('Kein Name eingegeben'));
        if (await get_One(guild_id, msg, args[1])) return msg.channel.send(error(bot, msg).setDescription('Bereits vorhanden'));
        create_Playlist(guild_id, msg, args[1]).then(() => {
          msg.channel.send(normal(bot, msg).setDescription('Playlist erstellt.'));
        });
        break;

      case 'add':
        if (!args[2]) return msg.channel.send(error(bot, msg).setDescription('Keine Url eingegeben'));
        let pl = await get_One(guild_id, msg, args[1]);
        if (!pl) return msg.channel.send(error(bot, msg).setDescription('Playlist nicht vorhanden.'));
        if (!pl.private && pl.created_by != msg.author.id) return msg.channel.send(error(bot, msg).setDescription('Keine Berechtigung für diese Playlist'));

        if (args[2].startsWith('https://www.youtube.com/playlist?list=')) {
          const songs = await getSongs(client.player, `${args[2]}`);
          if (!songs) {
            return msg.channel.send(error(client, msg).setDescription('Konnte nichts finden'));
          }

          for (let i = 0; i < songs.length; i++) {
            update(guild_id, args[1], songs[i].info.url, songs[i].info.title, msg.author.tag, songs[i].info, songs[i].track)
          }

          msg.channel.send('☑ **' + songs.length + '** Songs, zur Playlist: ' + args[1] + ' hinzugefügt');
          return;

        } else {
          let songs = null;
          if (args[2].startsWith('https://www.youtube.com/watch') || args[2].startsWith('https://youtu.be/')) {
            songs = await getSongs(client.player, `${args[2]}`);
          } else {
            songs = await getSongs(client.player, `ytsearch: ${args.slice(1)}`);
          }

          if (!songs) {
            return msg.channel.send(error(client, msg).setDescription('Konnte nichts finden.'));
          }

          if (songs.length > 1) {
            let description = songs.slice(0, 5).map((s, i) => '[**' + (i + 1) + '**] - [' + s.info.title + '](' + s.info.uri + ')').join('\n');
            msg.channel.send(normal(client, msg).setDescription(description + '\nWählen sie eine Zahl von 1-5 oder stop'))
              .then((m) => {
                const filter = (m) => m.author.id === msg.author.id;
                const collector = new MessageCollector(msg.channel, filter, {
                  time: 20000
                });
                collector.on('collect', (msgCollected) => {
                  let choice = msgCollected.content.split(' ')[0];
                  if (choice.toLowerCase() === 'stop') {
                    return collector.stop('STOPPED');
                  }
                  if (!choice || isNaN(choice)) {
                    return msg.channel.send(error(client, msg).setDescription('Keine Valide Eingabe'));
                  }
                  if (choice > songs.length || choice <= 0) {
                    return msg.channel.send(error(client, msg).setDescription('Keine Valide Eingabe!'));
                  }
                  let song = songs[(choice - 1)];
                  collector.stop('PLAY');
                  m.delete();
                  if (!song) return;
                  update(guild_id, args[1], song.info.url, song.info.title, msg.author.tag, song.info, song.track)
                  return message.channel.send(normal(client, msg).setTitle('Now Playing:').setDescription(
                    'Titel: [' + song.info.title + ']' + '(' + song.info.uri + ')\n' +
                    'Autor: ' + song.info.author + '\n' +
                    'Länge: ' + new String(song.info.length / 1000).toHHMMSS()
                  ));
                });
                collector.on('end', (collected, reason) => {
                  if (reason === 'STOPPED') {} else if (reason === 'PLAY') {
                    return;
                  } else {
                    return msg.channel.send(error(client, msg).setDescription('Ein Fehler ist passiert'));
                  }
                });
              })
              .catch((err) => {
                if (err) {
                  console.log(err);
                  return msg.channel.send(error(client, msg).setDescription('```JS\n' + err.msg + '```'));
                }
              });
          } else {
            let song = songs[0];
            update(guild_id, args[1], song.info.url, song.info.title, msg.author.tag, song.info, song.track)
            return msg.channel.send(normal(client, msg).setTitle('Now Playing:').setDescription(
              'Titel: [' + song.info.title + ']' + '(' + song.info.uri + ')\n' +
              'Autor: ' + song.info.author + '\n' +
              'Länge: ' + new String(song.info.length / 1000).toHHMMSS()
            ));
          }
        }
        break;

      default:
        return;
        break;
    }
  }
}

async function update(guild_id, name, url, title, added_by, info, track) {
  // Create a new playlist for a guild.
  // If the playlist already exists, then it will update the existing one.
  // => Required data: guild_id, songs[{ url, added_by}]
  // => Optional data: created_at, updated_at, songs[{ added_at, updated_at}]
  const exists = await db.findOne({
    name: name,
    guild_id: guild_id
  });
  if (exists) {
    let update = {}
    let songs = {
      track: track,
      url: url,
      name: title,
      added_by: added_by,
      added_at: Date.now(),
      info: info
    }
    update.updated_at = Date.now();
    try {
      const playlist = await db.findOneAndUpdate({
        name: name,
        guild_id: guild_id
      }, {
        update,
        $push: {
          songs: songs
        }
      });
      return true;
    } catch (err) {
      logger.error(err);
      // error
      return false;
    }
  }
}
async function create_Playlist(guild_id, msg, name) {
  const playlist = new db({
    guild_id: guild_id,
    name: name,
    created_at: Date.now(),
    created_by: msg.author.id,
    updated_at: Date.now(),
    private: false,
    songs: []
  });

  try {
    const newPlaylist = await playlist.save();
    return newPlaylist;
  } catch (err) {
    logger.error(err);
    return false;
  }
}

async function get(guild_id, msg) {
  try {
    const playlist = await db.find({
      guild_id: guild_id
    });
    if (playlist) return playlist;
    else {
      return false;
    }
  } catch (err) {
    logger.error(err);
    return false;
  }
}

async function get_One(guild_id, msg, name) {
  try {
    const playlist = await db.findOne({
      guild_id: guild_id,
      name: name
    });
    if (playlist) return playlist;
    else {
      return false;
    }
  } catch (err) {
    logger.error(err);
    return false;
  }
}

async function list(title, entries, page, increment, client, msg, listMsg, i) {

  // Set up base embed.
  var embed = normal(client, msg)
    .setTitle('**' + title + '**')
    .setDescription(`Page **${page}** of **${Math.ceil(entries.length/increment)}**`)

  let text = '';
  for (let queue of entries.slice((page - 1) * increment, (page * increment) + 1)) {
    text += '[' + (i + 1) + ']' + ' - ' + queue.name + '\n';
    i++;
  }

  embed.setDescription(text);
  // Edit/send embed.
  if (listMsg) await listMsg.edit(embed);
  else listMsg = await msg.channel.send(embed);

  // Set up page reactions.
  const lFilter = (reaction, user) => reaction.emoji.name === '◀' && page !== 1 && user.id === msg.author.id;
  const lCollector = listMsg.createReactionCollector(lFilter, {
    max: 1
  });

  lCollector.on('collect', async () => {
    rCollector.stop();
    await listMsg.reactions.removeAll();
    list(title, entries, page - 1, increment, client, msg, listMsg, i - (2 + (increment * 2)));
  });

  const rFilter = (reaction, user) => reaction.emoji.name === '▶' && entries.length > page * increment && user.id === msg.author.id;
  const rCollector = listMsg.createReactionCollector(rFilter, {
    max: 1
  });

  rCollector.on('collect', async () => {
    lCollector.stop();
    await listMsg.reactions.removeAll();
    list(title, entries, page + 1, increment, client, msg, listMsg, i);
  });

  if (page !== 1) await listMsg.react('◀');
  if (entries.length > page * increment) await listMsg.react('▶');
}