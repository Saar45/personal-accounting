const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Point papaparse to the non-minified source and shim out the Node
// 'stream' module it tries to require (we only use string parsing,
// not streaming, so the shim is safe).
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'papaparse') {
    return {
      filePath: require.resolve('papaparse/papaparse.js'),
      type: 'sourceFile',
    };
  }
  if (moduleName === 'stream') {
    return {
      filePath: path.resolve(__dirname, 'stream-shim.js'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
