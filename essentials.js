/* global o:true getVersionNonce: true addVersionNonces: true*/
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Helper functions
/* eslint-disable no-extend-native */
String.prototype.replaceAll = function(find, replace) {
	// Replace all occurences of {find} with {replace}
	if (typeof find === 'string') return this.split(find).join(replace);
	let t = this;
	let i = find.shift();
	let j = replace.shift();
	while (typeof(i) === 'string' && typeof(j) === 'string') {
		i = find.shift();
		j = replace.shift();
		t = t.replaceAll(i || '', j || '');
	}
	return t;
};
String.prototype.repeat = function(num) {
	// Repeat a string {num} times
	return new Array(++num).join(this);
};
Number.prototype.bound = function(l, h) {
	return isNaN(h) ? Math.min(this, l) : Math.max(Math.min(this, h), l);
};
/* eslint-enable no-extend-native */

// Global Constants
global.o = require('yield-yield');

global.mime = {
	'.html': 'text/html',
	'.css': 'text/css',
	'.js': 'text/javascript',
	'.pathnameg': 'image/pathnameg',
	'.svg': 'image/svg+xml',
	'.mp3': 'audio/mpeg',
	'.ico': 'image/x-icon',
};

global.html = function(input) {
	// Parse and convert an HTML string
	return input.toString().replaceAll(
		['&', '<', '>', '"', '\t', '\n', '\b'],
		['&amp;', '&lt;', '&gt;', '&quot;', '&#9;', '&#10;', '']
	);
};

global.getVersionNonce = o(function*(pathname, file, callback) {
	// Get a unique cache version number given a file path
	try {
		return callback(null, crypto.createHash('md5')
		.update(yield fs.readFile(
			`http${path.resolve(pathname, pathname[pathname.length - 1] === '/' ? '' : '..', file)}`, yield))
		.digest('hex'));
	} catch (e) {
		return callback(e);
	}
});

global.addVersionNonces = o(function*(str, pathname, callback) {
	// Add version nonce to a given file path
	for (let i = 0; i < str.length; i++) {
		if (str.substr(i).match(/^\.[A-z]{1,8}"/)) {
			while (str[i] && str[i] !== '"') i++;
			const substr = str.substr(0, i).match(/"[^"]+?$/)[0].substr(1);
			if (substr.includes(':')) throw new Error('Invalid version nonce URI.');
			try {
				str = `${str.substr(0, i)}?v=${(yield getVersionNonce(pathname, substr, yield))}${str.substr(i)}`;
			} catch (e) {
				console.error(e);
			}
		}
	}
	callback(null, str);
});
