module.exports = {
	"env": {
		"browser": true,
		"node": true,
		"es6": true
	},
	"rules": {
		"no-console": ["off"],
		"import/newline-after-import": ["off"],
		"no-param-reassign": ["off"],
		"consistent-return": ["off"],
		"no-shadow": ["off"],
		"no-undef": ["warn"],
		"indent": ["error", "tab"],
		"prefer-arrow-callback": ["warn"],
		"prefer-template": ["warn"],
		"max-len": ["error", 120],
		"no-underscore-dangle": ["off"]
	},
	"parser": "babel-eslint",
	"extends": "airbnb"
};