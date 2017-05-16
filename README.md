# magnet-plugin-sass

[![Build
Status](https://travis-ci.org/mthadley/magnet-plugin-sass.svg?branch=master)](https://travis-ci.org/mthadley/magnet-plugin-sass)

A magnet plugin for compiling your sass stylesheets.

## Usage

Add the following to your `magnet.config.js`:

```js
/**
 * Stylesheet should be served from '/css/index.css'
 */
module.exports = {
  magnet: {
    plugins: [
      'function',
      'controller',
      'sass'
    ],
    pluginsConfig: {
      sass: {
        src: 'src/stylesheets/index.scss'
      }
    }
  }
};
```
