module.exports = {
	"env": {
		"browser": true,
		"node": true,
		"es6": true
	},
	"rules": {
		"consistent-return": ["off"],
		"import/newline-after-import": ["off"],
		"indent": ["error", "tab"],
		"max-len": ["error", 120],
		"no-console": ["off"],
		"react/jsx-indent": ["off"],
		"react/no-multi-comp": ["off"],
		"react/jsx-indent-props": ["off"],
		"no-mixed-operators": ["error",
			{
				"groups": [
					["&", "|", "^", "~", "<<", ">>", ">>>"],
					["==", "!=", "===", "!==", ">", ">=", "<", "<="],
					["&&", "||"],
					["in", "instanceof"]
				]
			}],
		"no-param-reassign": ["off"],
		"no-shadow": ["off"],
		"no-undef": ["warn"],
		"no-underscore-dangle": ["off"],
		"no-unused-vars": ["warn"],
		"prefer-arrow-callback": ["warn"],
		"prefer-template": ["warn"],
	},
	"parser": "babel-eslint",
	"extends": "airbnb"
};