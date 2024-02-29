/* eslint-disable no-tabs */

module.exports = {
	env: {
		browser: true,
		es2021: true,
	},
	extends: [
		'plugin:vue/vue3-essential',
		'airbnb-base',
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'@vue/eslint-config-airbnb',
	],
	overrides: [
		{
			env: {
				node: true,
			},
			files: [
				'.eslintrc.{js,cjs}',
			],
			parserOptions: {
				sourceType: 'script',
			},
		},
	],
	parserOptions: {
		ecmaVersion: 'latest',
		parser: '@typescript-eslint/parser',
		sourceType: 'module',
	},
	plugins: [
		'@typescript-eslint',
		'vue',
	],
	rules: {
		'vue/component-definition-name-casing': [
			'off',
		],
		'no-tabs': 'off',
		indent: [
			'error',
			'tab',
		],
		quotes: [
			'error',
			'single',
		],
		semi: [
			'error',
			'always',
		],
		'vue/no-multiple-template-root': [
			'off',
		],
		'no-console': 'off',
		'object-curly-newline': 'off',
	},
};
