module.exports = {
	"env": {
		"browser": true,
		"node": true,
		"es6": true
	},
	"rules": {
		"comma-dangle": ["error"],
		"no-debugger": ["error"],
		"no-dupe-args": ["error"],
		"no-dupe-keys": ["error"],
		"no-duplicate-case": ["error"],
		"no-empty-character-class": ["error"],
		"no-ex-assign": ["error"],
		"no-extra-boolean-cast": ["error"],
		"no-extra-semi": ["error"],
		"no-func-assign": ["error"],
		"no-invalid-regexp": ["error"],
		"no-irregular-whitespace": ["error"],
		"no-negated-in-lhs": ["error"],
		"no-obj-calls": ["error"],
		"no-regex-spaces": ["error"],
		"no-sparse-arrays": ["error"],
		"no-unexpected-multiline": ["error"],
		"no-unreachable": ["error"],
		"use-isnan": ["error"],
		"valid-typeof": ["error"],
		"array-callback-return": ["error"],
		"dot-location": ["error", "property"],
		"no-caller": ["error"],
		"no-div-regex": ["error"],
		"no-empty-pattern": ["error"],
		"no-extra-bind": ["error"],
		"no-extra-label": ["error"],
		"no-fallthrough": ["error"],
		"no-floating-decimal": ["error"],
		"no-implied-eval": ["error"],
		"no-iterator": ["error"],
		"no-lone-blocks": ["error"],
		"no-multi-spaces": ["error"],
		"no-multi-str": ["error"],
		"no-native-reassign": ["error"],
		"no-new": ["error"],
		"no-new-func": ["error"],
		"no-new-wrappers": ["error"],
		"no-octal": ["error"],
		"no-octal-escape": ["error"],
		"no-proto": ["error"],
		"no-script-url": ["error"],
		"no-self-assign": ["error"],
		"no-self-compare": ["error"],
		"no-sequences": ["error"],
		"no-throw-literal": ["error"],
		"no-unmodified-loop-condition": ["error"],
		"no-unused-expressions": ["error", {"allowShortCircuit": true, "allowTernary": true}],
		"no-unused-labels": ["error"],
		"no-useless-concat": ["error"],
		"no-useless-escape": ["error"],
		"no-void": ["error"],
		"no-warning-comments": ["error"],
		"no-with": ["error"],
		"wrap-iife": ["error"],
		"yoda": ["error", "never"],
		"strict": ["error", "global"],
		"no-delete-var": ["error"],
		"no-label-var": ["error"],
		"no-shadow-restricted-names": ["error"],
		"callback-return": ["error"],
		"no-mixed-requires": ["error"],
		"no-new-require": ["error"],
		"no-path-concat": ["error"],
		"no-process-env": ["error"],
		"array-bracket-spacing": ["error"],
		"block-spacing": ["error", "never"],
		"camelcase": ["error"],
		"comma-spacing": ["error"],
		"comma-style": ["error"],
		"computed-property-spacing": ["error"],
		"id-length": ["error", {"min": 0, "max": 24}],
		"id-match": ["error", "^([a-zA-Z0-9]+|[A-Z0-9_]+)$"],
		"indent": ["error", "tab"],
		"key-spacing": ["error"],
		"keyword-spacing": ["error"],
		"linebreak-style": ["error"],
		"max-depth": ["error", 8],
		"max-nested-callbacks": ["error", 5],
		"max-statements-per-line": ["error", {"max": 2}],
		"new-cap": ["error"],
		"new-parens": ["error"],
		"no-array-constructor": ["error"],
		"no-lonely-if": ["error"],
		"no-mixed-spaces-and-tabs": ["error"],
		"no-multiple-empty-lines": ["error", {"max": 1, "maxBOF": 0, "maxEOF": 0}],
		"no-new-object": ["error"],
		"no-spaced-func": ["error"],
		"no-trailing-spaces": ["error"],
		"no-unneeded-ternary": ["error"],
		"no-whitespace-before-property": ["error"],
		"object-curly-spacing": ["error"],
		"operator-assignment": ["error"],
		"operator-linebreak": ["error", "after", {"overrides": {":": "before"}}],
		"padded-blocks": ["error", "never"],
		"quote-props": ["error", "as-needed", {"unnecessary": false}],
		"semi": ["error"],
		"semi-spacing": ["error"],
		"space-before-blocks": ["error"],
		"space-before-function-paren": ["error", "never"],
		"space-in-parens": ["error"],
		"space-infix-ops": ["error"],
		"space-unary-ops": ["error", {"words": false}],
		"spaced-comment": ["error", "always"],
		"arrow-body-style": ["error"],
		"arrow-spacing": ["error"],
		"constructor-super": ["error"],
		"max-len": ["error", 120],
		"generator-star-spacing": ["error", {"before": false, "after": false}],
		"no-class-assign": ["error"],
		"no-const-assign": ["error"],
		"no-dupe-class-members": ["error"],
		"no-new-symbol": ["error"],
		"no-this-before-super": ["error"],
		"no-useless-constructor": ["error"],
		"object-shorthand": ["error"],
		"prefer-spread": ["error"],
		"require-yield": ["error"],
		"template-curly-spacing": ["error", "never"],
		"yield-star-spacing": ["error", {"before": false, "after": true}]
	},
	"parser": "babel-eslint",
	"extends": "airbnb"
};