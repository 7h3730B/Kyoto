const { Schema, model } = require('mongoose');

const playlistSchema = new Schema({
    guild_id: { type: Number, required: true },
    name: { type: String, required: true },
    created_at: Date,
    created_by: { type: String, required: true },
    updated_at: Date,
    private: { type: Boolean, default: true },
    songs: [{
        track: { type: String },
        url: { type: String },
        name: { type: String },
        added_by: { type: String },
        added_at: Date,
        info: {}
    }]
});

module.exports = model('Playlist', playlistSchema);