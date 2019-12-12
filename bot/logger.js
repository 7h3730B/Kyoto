const winston = require("winston");
const conf = require("./config");

class log {
    constructor(){
        this._logger = winston.createLogger({
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: 'log' }),
            ],
            format: winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
        });
    }

    async info(message) {
        this._logger.log('info', message);
    }

    async debug(message) {
        if(conf.debug) this._logger.log('debug', message);
    }

    async warn(message) {
        this._logger.log('warn', message);
    }

    async error(message) {
        this._logger.log('error', message);
    }
}

module.exports = log;