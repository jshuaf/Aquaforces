/* eslint-disable no-extend-native */
String.prototype.replaceAll = function (find, replace) {
	if (typeof find === 'string') return this.split(find).join(replace);
	let t = this;
	let i;
	let j;
	while (typeof i === 'string' && typeof j === 'string') {
		i = find.shift();
		j = replace.shift();
		t = t.replaceAll(i || '', j || '');
	}
	return t;
};
String.prototype.repeat = function (num) {
	return new Array(++num).join(this);
};
Number.prototype.bound = function (l, h) {
	return isNaN(h) ? Math.min(this, l) : Math.max(Math.min(this, h), l);
};
HTMLCollection.prototype.indexOf = NodeList.prototype.indexOf = Array.prototype.indexOf;
HTMLCollection.prototype.forEach = NodeList.prototype.forEach = Array.prototype.forEach;
HTMLElement.prototype.insertAfter = function (newEl, refEl) {
	if (refEl.nextSibling) refEl.parentNode.insertBefore(newEl, refEl.nextSibling);
	else refEl.parentNode.appendChild(newEl);
};
String.prototype.capitalize = function () {
	return this.charAt(0).toUpperCase() + this.slice(1);
};

/* eslint-enable no-extend-native */

export function html(input) {
	return input.toString()
	.replaceAll(['&', '<', '>', '"', '\t', '\n', '\b'], ['&amp;', '&lt;', '&gt;', '&quot;', '&#9;', '&#10;', '']);
}

export function shuffle(array) {
	let currentIndex = array.length;
	let temporaryValue;
	let randomIndex;
	while (currentIndex !== 0) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}
	return array;
}
