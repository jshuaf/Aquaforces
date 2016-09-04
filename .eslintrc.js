module.exports = {
	"env": {
		"browser": true,
		"node": true,
		"es6": true,
		"jest": true,
	},
	"rules": {
		"consistent-return": ["off"],
		"import/newline-after-import": ["off"],
		"indent": ["error", "tab"],
		"max-len": ["error", 120],
		"no-console": ["off"],
		"react/jsx-indent": ["off"],
		"react/prop-types": ["warn"],
		"react/jsx-indent-props": ["off"],
		"react/no-string-refs": ["warn"],
		"react/no-find-dom-node": ["warn"],
		"react/jsx-closing-bracket-location": ["off"],
		"func-names": ["off"],
		"import/no-extraneous-dependencies": ["error", {"devDependencies": true}],
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
		"no-unused-vars": ["warn"],
		"no-underscore-dangle": ["off"],
		"no-shadow": ["off"],
		"prefer-arrow-callback": ["warn"],
		"prefer-template": ["warn"],
	},
	"parser": "babel-eslint",
	"extends": "airbnb"
};
