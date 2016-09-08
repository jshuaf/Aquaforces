const winston = require('winston');
const fs = require('fs');

if (!fs.existsSync('./__logs__')) {
	fs.mkdirSync('./__logs__');
}

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
			filename: '__logs__/info.log',
			level: 'info',
		}),
		new (winston.transports.File)({
			name: 'error-file',
			filename: '__logs__/error.log',
			level: 'error',
			handleExceptions: true,
			humanReadableUnhandledException: true,
		}),
		new (winston.transports.File)({
			name: 'warn-file',
			filename: '__logs__/warnings.log',
			level: 'warn',
		}),
	],
});
