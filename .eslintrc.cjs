module.exports = {
	root: true,
	extends: ['eslint:recommended', 'prettier'],
	plugins: ['svelte3', 'prettier'],
	overrides: [{ files: ['*.svelte'], processor: 'svelte3/svelte3' }],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	rules: {
		'prettier/prettier': 'warn',
		curly: ['warn', 'multi'],
		'object-shorthand': 'warn',
		'operator-assignment': 'warn',
		'no-else-return': 'warn',
		'no-lonely-if': 'warn',
		'no-unneeded-ternary': 'warn',
		'prefer-arrow-callback': 'warn',
		'prefer-const': 'warn',
		'prefer-destructuring': 'warn',
		'prefer-template': 'warn'
	}
};
