// rollup.config.js
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/umd-bundle.js',
    name: 'envjs',
    format: 'umd',
    sourcemap: 'inline',
  },
  plugins: [
    replace({
      VERSION: process.env.npm_package_version,
    }),
    resolve(),
    commonjs(),
    babel({
      exclude: 'node_modules/**'
    }),
  ]
};
