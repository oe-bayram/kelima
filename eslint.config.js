// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      'dist/*',
      'node_modules/*',
      '.expo/*',
      'coverage/*',
      'amplify/**',
      'scripts/**',
      '.agents/*',
      'design-system/**', // gespiegeltes Design-System (Web-Referenz, kein App-Code)
    ],
  },
]);
