import byyuurin from '@byyuurin/eslint-config'

export default byyuurin(
  {},
  {
    files: ['src/generator.ts'],
    rules: {
      'unicorn/no-object-as-default-parameter': 'off',
      'unicorn/no-unreadable-array-destructuring': 'off',
    },
  },
)
