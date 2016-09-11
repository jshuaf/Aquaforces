import color from 'color';

const hsvToHex = (h, s, v) => color({ h, s, v }).hexString();

module.exports = {
	// greens
	mantis: hsvToHex(124, 48, 77),
	wasabi: hsvToHex(125, 35, 81),
	pistachio: hsvToHex(125, 25, 86),
	// reds
	coral: hsvToHex(357, 54, 93),
	rosebud: hsvToHex(358, 44, 96),
	cupid: hsvToHex(358, 34, 98),
	// yellows
	gold: hsvToHex(48, 61, 93),
	lemon: hsvToHex(50, 54, 95),
	lightning: hsvToHex(50, 54, 95),
	// blues
	pacific: hsvToHex(180, 94, 71),
	seaspray: hsvToHex(183, 41, 95),
	midnight: hsvToHex(210, 35, 31),
	cloud: hsvToHex(210, 8, 100),
	ice: hsvToHex(180, 7, 99),
};
