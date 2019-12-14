const fetch = require('node-fetch');
const {
    URLSearchParams
} = require('url');
const {
    MessageCollector
} = require('discord.js');
const {
    normal,
    error
} = require('./utils');

module.exports.getSongs = (player, search) => {
    const node = player.nodes.first();
    const params = new URLSearchParams();

    params.append('identifier', search);

    return fetch(`http://${node.host}:${node.port}/loadtracks?${params.toString()}`, {
            headers: {
                Authorization: node.password
            }
        })
        .then((res) => res.json())
        .then((data) => data.tracks)
        .catch((err) => {
            console.error(err);
            return null;
        });
};

module.exports.getCurrentQueue = (queues, guildID) => {
    if (!queues[guildID]) { queues[guildID] = []; }
    return queues[guildID];
};

module.exports.play = (client, message) => {
    try {
        let queue = this.getCurrentQueue(client.audioQueue, message.guild.id);
        if (queue.length === 0) {
            return; // client.player.leave(message.guild.id)
        }
        const player = client.player.get(message.guild.id);
        let currentTrack = queue[0];
        if (!player) return message.channel.send(error(client, message).setDescription('Konnte nicht connecten'));

        player.play(currentTrack.track);
        player.once('error', (e) => {
            if (e) {
                // message.channel.send(error(client, message).setDescription('```JS\n' + e.message + '```'));
            }
        });
        player.once('end', (data) => {
            if (data.reason === 'REPLACED') {
                return;
            }
            if (!currentTrack.loop) {
                queue.shift();
            }
            if (data.reason === 'STOPPED' && queue.length === 0) {
                // finished
            }
            this.play(client, message);
        });
    } catch (exception) {
        if (exception) {
            console.log(exception);
            return // message.channel.send(error(client, message).setDescription('```JS\n' + exception.message + '```'));
        }
    }
};

module.exports.addToQueue = async (client, message, track) => {
    try {
        let queue = this.getCurrentQueue(client.audioQueue, message.guild.id);

        if (track.startsWith('https://www.youtube.com/playlist?list=') || track.startsWith('https://open.spotify.com/playlist/')) {
            const songs = await this.getSongs(client.player, `${track}`);
            if (!songs) {
                return message.channel.send(error(client, message).setDescription('Konnte nichts finden'));
            }
            for (let i = 0; i < songs.length; i++) {
                queue.push({
                    track: songs[i].track,
                    author: message.author.tag,
                    loop: false,
                    info: {
                        identifier: songs[i].info.identifier,
                        title: songs[i].info.title,
                        duration: songs[i].info.length,
                        author: songs[i].info.author,
                        url: songs[i].info.uri,
                        stream: songs[i].info.isStream,
                        seekable: songs[i].info.isSeekable
                    }
                });
            }
            if (queue.length > songs.length) {
                return message.channel.send('☑ **' + songs.length + '** Songs hinzugefügt!');
            } else {
                message.channel.send('☑ **' + songs.length + '** Songs hinzugefügt!');
            }
            return this.play(client, message);
        } else {
            let songs = null;
            if (track.startsWith('https://www.youtube.com/watch') || track.startsWith('https://youtu.be/')) {
                songs = await this.getSongs(client.player, `${track}`);
            } else {
                songs = await this.getSongs(client.player, `ytsearch: ${track}`);
            }
            if (!songs) {
                return message.channel.send(error(client, message).setDescription('Konnte nichts finden.'));
            }

            if (songs.length > 1) {
                let description = songs.slice(0, 5).map((s, i) => '[**' + (i + 1) + '**] - [' + s.info.title + '](' + s.info.uri + ')').join('\n');
                message.channel.send(normal(client, message).setDescription(description + '\nWählen sie eine Zahl von 1-5 oder stop'))
                    .then((m) => {
                        const filter = (m) => m.author.id === message.author.id;
                        const collector = new MessageCollector(message.channel, filter, {
                            time: 20000
                        });
                        collector.on('collect', (msgCollected) => {
                            let choice = msgCollected.content.split(' ')[0];
                            if (choice.toLowerCase() === 'stop') {
                                return collector.stop('STOPPED');
                            }
                            if (!choice || isNaN(choice)) {
                                collector.stop('STOPPED');
                                return message.channel.send(error(client, message).setDescription('Keine Valide Eingabe'));
                            }
                            if (choice > songs.length || choice <= 0) {
                                collector.stop('STOPPED');
                                return message.channel.send(error(client, message).setDescription('Keine Valide Eingabe!'));
                            }
                            let song = songs[(choice - 1)];
                            collector.stop('PLAY');
                            m.delete();
                            if(!song) return;
                            queue.push({
                                track: song.track,
                                author: message.author.tag,
                                loop: false,
                                info: {
                                    identifier: song.info.identifier,
                                    title: song.info.title,
                                    duration: song.info.length,
                                    author: song.info.author,
                                    url: song.info.uri,
                                    stream: song.info.isStream,
                                    seekable: song.info.isSeekable
                                }
                            });
                            if (queue.length > 1) {
                                return message.channel.send(normal(client, message).setTitle('Now Playing:').setDescription(
                                    'Titel: [' + song.info.title + ']'+'('+song.info.uri+')\n' +
                                    'Autor: ' + song.info.author + '\n' +
                                    'Länge: ' + new String(song.info.length/1000).toHHMMSS()
                                ));
                            }
                            return this.play(client, message);
                        });
                        collector.on('end', (collected, reason) => {
                            if (reason === 'STOPPED') {
                            } else if (reason === 'PLAY') {
                                return;
                            } else {
                                return message.channel.send(error(client, message).setDescription('Ein Fehler ist passiert'));
                            }
                        });
                    })
                    .catch((err) => {
                        if (err) {
                            console.log(err);
                            return // message.channel.send(error(client, message).setDescription('```JS\n' + err.message + '```'));
                        }
                    });
            } else {
                let song = songs[0];
                queue.push({
                    track: song.track,
                    author: message.author.tag,
                    loop: false,
                    info: {
                        identifier: song.info.identifier,
                        title: song.info.title,
                        duration: song.info.length,
                        author: song.info.author,
                        url: song.info.uri,
                        stream: song.info.isStream,
                        seekable: song.info.isSeekable
                    }
                });
                if (queue.length > 1) {
                    return message.channel.send(normal(client, message).setTitle('Now Playing:').setDescription(
                        'Titel: [' + song.info.title + ']'+'('+song.info.uri+')\n' +
                        'Autor: ' + song.info.author + '\n' +
                        'Länge: ' + song.info.length
                    ));
                }
                return this.play(client, message);
            }
        }
    } catch (exception) {
        if (exception) {
            console.log(exception);
            return//  message.channel.send(error(client, message).setDescription('```JS\n' + exception.message + '```'));
        }
    }
};