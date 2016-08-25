String.prototype.replaceAll = function (find, replace) {
	if (typeof find === 'string') return this.split(find).join(replace);
		let t = this, i, j;
	while (typeof(i = find.shift()) === 'string' && typeof(j = replace.shift()) === 'string') t = t.replaceAll(i || '', j || '');
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
function html(input) {
	return input.toString().replaceAll(['&', '<', '>', '"', '\t', '\n', '\b'], ['&amp;', '&lt;', '&gt;', '&quot;', '&#9;', '&#10;', '']);
}

function shuffle(array) {
	let currentIndex = array.length, temporaryValue, randomIndex;
	while (currentIndex !== 0) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}
	return array;
}
