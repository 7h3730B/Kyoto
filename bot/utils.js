const { RichEmbed } = require('discord.js');

module.exports.normal = function normal(client, message) {
    return new RichEmbed().setColor('00ff00').setAuthor(client.user).setTimestamp().setFooter("Executed by: " + message.author.username, message.author.avatarURL);
}

module.exports.error = function error(client, message) {
    return new RichEmbed().setColor('ff0800').setAuthor(client.user).setTimestamp().setFooter("Executed by: " + message.author.username, message.author.avatarURL);
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
    ADMIN: {
        name: 'Admin',
        level: 8
    },
    MOD: {
        name: 'Mod',
        level: 5
    },
    USER: {
        name: 'User',
        level: 1
    }
}