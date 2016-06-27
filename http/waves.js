'use strict';
'use asm';
var canvas = document.getElementById('canvas'),
	ctx = canvas.getContext('2d'),
	width = innerWidth,
	height = innerHeight;
Object.getOwnPropertyNames(Math).forEach(function(element, index) {
	window[element] = Math[element];
});
var TAU = 2 * PI;
function rand(x, y) {
	if (!x && x != 0) {
		x = 0;
		y = 1;
	} else if (!y && y != 0) {
		y = x;
		x = 0;
	}
	return random() * (y - x) + x;
}
function resizeHandler() {
	canvas.style.zoom = 100 / devicePixelRatio + '%';
	size();
	for (var i = 0; i < 3; i++) draw();
}
addEventListener('resize', resizeHandler);
function size() {
	if (location.href.indexOf('host') != -1) {
		height = innerWidth * devicePixelRatio;
		width = innerHeight * devicePixelRatio * 0.5;
	} else {
		width = innerWidth * devicePixelRatio;
		height = innerHeight * devicePixelRatio;
	}
	canvas.width = width;
	canvas.height = height;
}
var frameRate = 20;
var values = [];
var nx = location.href.indexOf('host') != -1 ? 15 : 20;
var ny = location.href.indexOf('host') != -1 ? 40 : 20;
for (var i = 0; i < nx; i++) {
	var v = [];
	for (var j = 0; j < ny; j++) v.push([0, +rand(-5, 5)]);
	values.push(v);
}
var ent = +0, oent = +0;
var frameCount = 0;
function draw() {
	var dx = width / (nx - 1);
	var dy = height / (ny - 1);
	var sx = width / 2 - nx * dx / 2;
	var sy = height / 2 - ny * dy / 2;
	var saa = +0.02;
	var sad = +-1e-8;
	var bent = +2e4 * +nx * +ny;
	var sa = +0.002;
	var sv = +0.6;
	var sd = location.href.indexOf('host') != -1 ? +0.6 : +1;
	var radius = max(dx, max(dy, min(dx, dy) * 1.5));
	var lastTime = new Date().getTime();
	oent = +ent;
	ent = +0;
	var lastRow = [];
	for (var x = 0; x < values.length; x++) {
		for (var y = 0; y < values[x].length; y++) {
			if (values[x - 1]) values[x][y][1] += +sa * +values[x - 1][y][0];
			if (values[x + 1]) values[x][y][1] += +sa * +values[x + 1][y][0];
			if (values[x][y - 1]) values[x][y][1] += +sa * +values[x][y - 1][0];
			if (values[x][y + 1]) values[x][y][1] += +sa * +values[x][y + 1][0];
			values[x][y][1] -= +saa * +values[x][y][0];
			values[x][y][1] *= +1 + +sad * +(+oent * +oent - +bent);
			values[x][y][0] += +sv * +values[x][y][1];
			if (isNaN(values[x][y][0])) values[x][y][0] = 0;
			if (isNaN(values[x][y][1])) values[x][y][1] = +rand(-5, 5);
			ent += +values[x][y][1] * +values[x][y][1];
		}
		lastRow.push(values[x][values[x].length - 1]);
	}
	if (isFlowing && frameCount % 3 == 0) {
		for (var x = 0; x < values.length; x++) {
			values[x].pop();
			values[x].unshift(lastRow[x]);
		}
	}
	for (var x = 0; x < values.length; x++) {
		for (var y = 0; y < values[x].length; y++) {
			fill(hsl(200, 100, 60 + +values[x][y][0] * +sd, 0.03));
			var r = radius * rand(0.8, 1.2);
			ellipse(+x * +dx + +sx, +y * +dy + +sy, r, r);
		}
	}
	frameCount++;
}
(function drawLoop() {
	draw();
	setTimeout(drawLoop, 1000 / frameRate);
}());
function font(f) {
	ctx.font = f;
}
function text(x, y, t) {
	ctx.fillText(t, x, y);
}
function ellipse(cx, cy, rx, ry) {
	ctx.save();
	ctx.beginPath();
	ctx.translate(cx - rx, cy - ry);
	ctx.scale(rx, ry);
	ctx.arc(1, 1, 1, 0, TAU, false);
	ctx.restore();
	ctx.fill();
}
function fill(color, g, b) {
	if (color >= 0) {
		if (b >= 0) ctx.fillStyle = rgb(color, g, b);
		else ctx.fillStyle = rgb(color, color, color);
	} else ctx.fillStyle = color;
}
function hsl(h, s, l, a) {
	return 'hsla(' + round(h) + ',' + round(s) + '%,' + round(l) + '%,' + (a === undefined ? 1 : a) + ')';
}
function rect(x, y, w, h) {
	ctx.fillRect(x, y, w, h);
}
function bg() {
	var oldFill = ctx.fillStyle;
	fill.apply(this, arguments);
	ctx.fillRect(0, 0, width, height);
	fill(oldFill);
}
resizeHandler();