import resolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';

export default {
    entry: 'src/muta.js',
    format: 'umd',
    dest: './dist/muta.umd.min.js', // equivalent to --output
    plugins: [
        resolve(),
        uglify()
    ],
    moduleName: 'Muta',
    sourceMap: true
};