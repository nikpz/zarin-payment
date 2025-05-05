/**Logger is here to generate SQL logs commands modifying the file libs/config.development.js to load our module logger
 */
const fs = require('fs');
const winston = require('winston');

if(!fs.existsSync('logs')){
    fs.mkdirSync('logs');
}

const options ={
    file: {
        level: 'info',
        name: 'file.info',
        filename: 'logs/app.log',
        handleExceptions: true,
        timestamp: true,
        json: true,
        maxsize: 5242880,   //5MB
        maxFiles: 100,
        colorize: true
    },
    errorFile: {
        level: 'error',
        name: 'file.error',
        filename: 'logs/error.log',
        timestamp: true,
        handleExceptions: true,
        json: true,
        maxsize: 5242880,   //5MB
        maxFiles: 100,
        colorize: true,
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        timestamp: true,
        json: true,
        colorize: true
    },
};


//Your centralized logger object
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json(), winston.format.splat(), winston.format.errors({stack: true})),
    // Responsible for creating and maintaining several recent logs files
    // A transport is essentially a storage device for your logs.
    // Each instance of a winston logger can have multiple transports configured at different levels
    defaultMeta: {service: 'user-service'},
    transports: [
        new (winston.transports.Console)(options.console),
        new (winston.transports.File)(options.file),
        new (winston.transports.File)(options.errorFile)
    ],
    // exitOnError: false, //do not exit on handled exceptions
});



module.exports = logger;
