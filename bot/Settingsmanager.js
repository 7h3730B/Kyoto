const mongoose = require('mongoose');
const GuildSchematic = require('./models/GuildSchematic');
const PlaylistSchema = require('./models/PlaylistSchema');
const config = require('./config.json');

module.exports = class Settingsmanager {
    constructor(){
        this._url = config.url;

        mongoose.connect(config.mongodb.url, {
            useNewUrlParser: true,
            autoIndex: false,
            reconnectTries: Number.MAX_VALUE,
            reconnectInterval: 500,
            poolSize: 5,
            connectTimeoutMS: 10000,
            family: 4
        });
        this.db = mongoose.connection;
        this.db.on('error', console.error.bind(console, 'connection error:'));
        this.db.once('open', function() {
            logger.info("DB opened");
        });

        this.db.on('connected', () => {
            logger.info('Mongoose connection successfully opened!');
        });
        
        this.db.on('err', err => {
            logger.error(`Mongoose connection error: \n ${err.stack}`);
        });
        
        this.db.on('disconnected', () => {
            logger.info('Mongoose connection disconnected');
        });
    }

    async getGuild(guild) {
        const data = await GuildSchematic.findOne({ guildID: guild.id });
        if (data) return await data;
        else {
                const newGuild = {
                    guildID: guild.id,
                };
            
                try {
                    await this.createGuild(newGuild);
                } catch (error) {
                    logger.error(error);
                }
            return await this.createGuild()
        };
    };

    async updateGuild (guild, settings) {
        let data = this.getGuild(guild);

        if (typeof data !== 'object') data = {};
        for (const key in settings) {
            if (data[key] !== settings[key]) data[key] = settings[key];
            else return;
        }
        return await data.updateOne(settings);
    };

    async createGuild (settings) {
        const defaults = Object.assign({ _id: mongoose.Types.ObjectId() }, config.defaultSettings);
        const merged = Object.assign(defaults, settings);

        const newGuild = await new GuildSchematic(merged);
        return await newGuild.save()
    };
}
