const logger = require('./bot/logger');

global.logger = new logger();;
module.exports = require('./bot/bot');