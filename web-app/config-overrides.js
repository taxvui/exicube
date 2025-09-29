var path = require('path')

const { override, babelInclude, addWebpackPlugin } = require('customize-cra')
const webpack = require('webpack')

module.exports = function (config, env) {
  return Object.assign(
    config,
    override(
      babelInclude([
        /* transpile (converting to es5) code in src/ and shared component library */
        path.resolve('src'),
        path.resolve('../common'),
      ]),
      // Add webpack plugin to provide process for environment variables
      addWebpackPlugin(
        new webpack.ProvidePlugin({
          process: 'process',
          Buffer: ['buffer', 'Buffer'],
        })
      ),
      // Fix for React 19.0.0 compatibility
      (config) => {
        // Add node polyfills
        config.resolve.fallback = {
          ...config.resolve.fallback,
          process: require.resolve('process/browser'),
          buffer: require.resolve('buffer'),
          util: require.resolve('util'),
          stream: false,
          path: false,
        };
        
        // Handle ESM modules
        config.module.rules.push({
          test: /\.m?js/,
          resolve: {
            fullySpecified: false,
          },
        });
        
        // Fix moment.js locale loading by providing an empty module
        config.resolve.alias = {
          ...config.resolve.alias,
          './locale': path.resolve(__dirname, 'src/empty-module.js'),
        };
        
        // Add process polyfill globally to deal with ESM modules
        config.plugins.push(
          new webpack.ProvidePlugin({
            process: 'process/browser'
          })
        );
        
        // Fix for jspdf/canvg ESM module
        config.module.rules.push({
          test: /canvg|jspdf|rgbcolor/,
          resolve: {
            alias: {
              'process/browser': require.resolve('process/browser')
            }
          }
        });
        
        // Completely disable source map warnings
        config.ignoreWarnings = [
          // Moment.js locale warning
          /Module not found: Error: Can't resolve '\.\/locale'/,
          // Source map warning
          /Failed to parse source map/,
        ];
        
        return config;
      }
    )(config, env)
  )
}