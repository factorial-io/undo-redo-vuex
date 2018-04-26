const merge = require('webpack-merge');
const path = require('path');

module.exports = {
  entry: path.resolve(__dirname + '/src/undoRedo.js'),
  output: {
    path: path.resolve(__dirname + '/dist/'),
    filename: 'undo-redo-vuex.min.js',
    libraryTarget: 'window',
    library: 'UndoRedoVuex',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: __dirname,
        exclude: /node_modules/,
      },
    ],
  }
};
