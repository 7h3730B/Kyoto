const mongoose = require('mongoose');

const guildsettings = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    guildID: { type: String, require: true, unique: true },
    prefix: String
});

module.exports = mongoose.model('GuildSettings', guildsettings);