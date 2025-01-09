// const path = require('path');
// const { VueLoaderPlugin } = require('vue-loader');

// module.exports = {
//   mode: 'development',
//   entry: './src/main.js',
//   output: {
//     path: path.resolve(__dirname, 'dist'),
//     filename: 'bundle.js',
//   },
//   target: 'electron-renderer',
//   module: {
//     rules: [
//       {
//         test: /\.vue$/,
//         loader: 'vue-loader',
//       },
//       {
//         test: /\.js$/,
//         loader: 'babel-loader',
//         exclude: /node_modules/,
//       },
//       {
//         test: /\.svelte$/,
//         exclude: /node_modules/,
//         use: [
//           {
//             loader: 'babel-loader',
//           },
//           {
//             loader: 'svelte-loader',
//             options: {
//               preprocess: require('svelte-preprocess')({
//                 postcss: true,
//               }),
//             },
//           },
//         ],
//       },
//     ],
//   },
//   plugins: [new VueLoaderPlugin()],
//   resolve: {
//     alias: {
//       vue$: 'vue/dist/vue.esm.js',
//     },
//     extensions: ['.js', '.vue', '.json', '.svelte'],
//   },
//   node: {
//     __dirname: false,
//     __filename: false,
//   },
// };