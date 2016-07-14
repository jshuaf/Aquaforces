'use strict';
function smoothScroll(el, t, p, s) {
	p = t - p;
	var dist = el.getBoundingClientRect().top,
		now = new Date().getTime();
	s = s || now;
	var elapsed = now - s;
	if (dist > 6 && document.body.scrollTop - document.body.scrollHeight + innerHeight) {
		scrollBy(0, Math.min(dist - 5, Math.max(1, p * dist * elapsed * elapsed / 50000000)));
		requestAnimationFrame(function(p) {
			smoothScroll(el, p, t, s);
		});
	}
}
document.getElementById('scroll').addEventListener('click', function() {
	smoothScroll(document.getElementById('benefits'));
});