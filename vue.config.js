module.exports = {
  publicPath: process.env.NODE_ENV === 'development' ? '' : './',
  configureWebpack: () => {
    if (process.env.NODE_ENV !== 'production') {
      devtool: 'source-map'
    }
  },
  productionSourceMap: false,
  chainWebpack: (config) => {
    config
      .plugin('html')
      .tap((args) => {
        args[0].title = 'APRENDE LAS PROVINCIAS ESPAÑOLAS';
        return args;
      });
  },
};
