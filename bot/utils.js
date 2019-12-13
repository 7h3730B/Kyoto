const { MessageEmbed } = require('discord.js');

module.exports.normal = function normal(client, message) {
    return new MessageEmbed()
    .setColor('00ff00')
    .setAuthor(client.user.username, client.user.avatar)
    .setTimestamp()
    .setFooter("Ausgeführt bei: " + message.author.username, message.author.avatarURL);
}

module.exports.error = function error(client, message) {
    return new MessageEmbed()
    .setColor('ff0800')
    .setAuthor(client.user.username, client.user.avatar)
    .setTimestamp()
    .setFooter("Ausgeführt bei: " + message.author.username, message.author.avatarURL);
}

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }

    if (hours == 0) return minutes + ':' + seconds;
    return hours + ':' + minutes + ':' + seconds;
}

module.exports.perms = {
    BOTOWNER: {
        name: 'Botowner',
        level: 99
    },
    GUILDOWNER: {
        name: 'Guildowner',
        level: 10
    },
    DJ: {
        name: 'DJ',
        level: 5
    },
    USER: {
        name: 'User',
        level: 1
    }
}

module.exports.list = async(title, entries, page, increment, client, msg, listMsg, i) => {
  
    // Set up base embed.
    var embed = this.normal(client, msg)
      .setTitle('**'+title+'**')
      .setDescription(`Page **${page}** of **${Math.ceil(entries.length/increment)}**`)

    let text = '';
    for (let queue of entries.slice((page - 1) * increment, (page * increment) + 1)) {
        i++;
        text += '['+i+']' + ' - [' + queue.info.title + ']('+ queue.info.url + ')\n';
    }
    
    embed.setDescription(text);
    // Edit/send embed.
    if (listMsg) await listMsg.edit(embed);
    else listMsg = await msg.channel.send(embed);
  
    // Set up page reactions.
    const lFilter = (reaction, user) => reaction.emoji.name === '◀' && page !== 1 && user.id === msg.author.id;
    const lCollector = listMsg.createReactionCollector(lFilter, { max: 1 });
  
    lCollector.on('collect', async () => {
      rCollector.stop();
      await listMsg.reactions.removeAll();
      this.list(title, entries, page - 1, increment, client, msg, listMsg, i-(2+(increment*2)));
    });
  
    const rFilter = (reaction, user) => reaction.emoji.name === '▶' && entries.length > page * increment && user.id === msg.author.id;
    const rCollector = listMsg.createReactionCollector(rFilter, { max: 1 });
  
    rCollector.on('collect', async () => {
      lCollector.stop();
      await listMsg.reactions.removeAll();
      this.list(title, entries, page + 1, increment, client, msg, listMsg, i);
    });
  
    if (page !== 1) await listMsg.react('◀');
    if (entries.length > page * increment) await listMsg.react('▶');
  }