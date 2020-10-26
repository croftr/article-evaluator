const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf, colorize } = format;

const level = process.env.LOG_LEVEL || 'debug';

const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});

format.colorize();

const logger = createLogger({    
    format: combine(
        colorize(),
        timestamp(),
        myFormat,        
    ),
    level,
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'combined.log' })
    ]
});

module.exports = logger