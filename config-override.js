const webpack = require('webpack');

module.exports = function override(config) {
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    assert: require.resolve('assert'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    os: require.resolve('os-browserify'),
    url: require.resolve('url'),
  });
  config.resolve.fallback = fallback;
  // axios 1.x (and the Symbol OpenAPI SDK that depends on it) ship ESM that
  // imports 'process/browser' without an extension. webpack 5 enforces
  // fully-specified ESM requests, so relax that for .mjs/.js modules.
  config.module.rules.push({
    test: /\.m?js$/,
    resolve: { fullySpecified: false },
  });
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ]);
  return config;
};
