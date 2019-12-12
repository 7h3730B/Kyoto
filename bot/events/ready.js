const config = require('../config.json');
const { PlayerManager } = require('discord.js-lavalink');

module.exports = async (client) => {
    client.player = new PlayerManager(client, config.nodes, {
        user: client.user.id,
        shards: client.shard ? client.shard.count : 0
    });
    logger.info("Bot is Online")
};