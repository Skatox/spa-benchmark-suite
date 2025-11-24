import js from '@eslint/js'
import globals from 'globals'
import svelte from 'eslint-plugin-svelte'

export default [
  {
    ignores: ['node_modules', 'dist', '.svelte-kit']
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: svelte.parser,
      parserOptions: {
        extraFileExtensions: ['.svelte']
      },
      globals: { ...globals.browser }
    },
    plugins: { svelte },
    rules: {
      ...svelte.configs['flat/recommended'].rules
    }
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      ...js.configs.recommended.rules
    }
  }
]
