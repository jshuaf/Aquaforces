const winston = require('winston');

module.exports = new (winston.Logger)({
	transports: [
		new (winston.transports.Console)({
			name: 'console-errors',
			level: 'error',
			prettyPrint: true,
			colorize: true,
		}),
		new (winston.transports.Console)({
			name: 'console-warnings',
			level: 'warn',
			prettyPrint: true,
			colorize: true,
		}),
		new (winston.transports.File)({
			name: 'info-file',
			filename: 'logs/info.log',
			level: 'info',
		}),
		new (winston.transports.File)({
			name: 'error-file',
			filename: 'logs/error.log',
			level: 'error',
			handleExceptions: true,
			humanReadableUnhandledException: true,
		}),
		new (winston.transports.File)({
			name: 'warn-file',
			filename: 'logs/warnings.log',
			level: 'warn',
		}),
	],
});
