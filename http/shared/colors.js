import color from 'color';

const hsvToHex = (h, s, v) => color({ h, s, v }).hexString();

module.exports = {
	mantis: hsvToHex(124, 48, 77),
	wasabi: hsvToHex(125, 35, 81),
	pistachio: hsvToHex(125, 25, 86),
	coral: hsvToHex(357, 44, 93),
	rosebud: hsvToHex(358, 34, 96),
	cupid: hsvToHex(358, 21, 98),
	gold: hsvToHex(48, 61, 93),
	lemon: hsvToHex(50, 54, 95),
	lightning: hsvToHex(50, 54, 95),
	pacific: hsvToHex(180, 94, 71),
	seaspray: hsvToHex(183, 41, 95),
	midnight: hsvToHex(210, 35, 31),
};
