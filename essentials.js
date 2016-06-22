'use strict';
const crypto = require('crypto'),
	fs = require('fs'),
	path = require('path');
String.prototype.replaceAll = function(find, replace) {
	if (typeof find == 'string') return this.split(find).join(replace);
	let t = this, i, j;
	while (typeof(i = find.shift()) == 'string' && typeof(j = replace.shift()) == 'string') t = t.replaceAll(i || '', j || '');
	return t;
};
String.prototype.repeat = function(num) {
	return new Array(++num).join(this);
};
Number.prototype.bound = function(l, h) {
	return isNaN(h) ? Math.min(this, l) : Math.max(Math.min(this, h), l);
};
global.o = require('yield-yield');
global.mime = {
	'.html': 'text/html',
	'.css': 'text/css',
	'.js': 'text/javascript',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
	'.mp3': 'audio/mpeg',
	'.ico': 'image/x-icon'
};
global.html = function(input) {
	return input.toString().replaceAll(['&', '<', '>', '"', '\t', '\n', '\b'], ['&amp;', '&lt;', '&gt;', '&quot;', '&#9;', '&#10;', '']);
};
global.getVersionNonce = o(function*(pn, file, cb) {
	try {
		return cb(null, crypto.createHash('md5').update(yield fs.readFile('http' + path.resolve(pn, pn[pn.length - 1] == '/' ? '' : '..', file), yield)).digest('hex'));
	} catch (e) {
		return cb(e);
	}
});
global.addVersionNonces = o(function*(str, pn, cb) {
	for (let i = 0; i < str.length; i++) {
		if (str.substr(i).match(/^\.[A-z]{1,8}"/)) {
			while (str[i] && str[i] != '"') i++;
			let substr = str.substr(0, i).match(/"[^"]+?$/)[0].substr(1);
			if (substr.includes(':')) continue;
			try {
				str = str.substr(0, i) + '?v=' + (yield getVersionNonce(pn, substr, yield)) + str.substr(i);
			} catch (e) {
				console.error(e);
			}
		}
	}
	cb(null, str);
});