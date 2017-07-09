
module.exports = {
  resolve: {
    alias: {
      'vue': 'vue/dist/vue.common.js'
    }
  },
  entry: {
    'main': './src/js/main.js'
  },
  output: {
    path: __dirname + '/build',
    filename: './[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
    ]
  }

};
