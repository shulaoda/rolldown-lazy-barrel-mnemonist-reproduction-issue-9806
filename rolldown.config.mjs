import { defineConfig } from 'rolldown';

// Reproduces https://github.com/rolldown/rolldown/issues/9806.
// The bug occurs with the default `experimental.lazyBarrel: true`.
// Uncommenting the `lazyBarrel: false` block below works around it: the bundle then prints `1`.
export default defineConfig({
  input: 'entry.mjs',
  output: {
    file: 'dist/out.mjs',
    format: 'esm',
  },
  // experimental: {
  //   lazyBarrel: false,
  // },
});
