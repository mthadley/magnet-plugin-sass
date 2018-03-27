import * as sass from 'node-sass';
import express from 'express';
import fs from 'fs-extra';
import path from 'path';

/**
 * The output directory for the Sass plugin
 */
const sassDir = '.magnet/sass';

/**
 * Flag indicating whether or not sass files have been
 * served yet.
 */
let isServingSassFiles = false;

/**
 * Serves built sass files using magnet server instance
 * @param {!Magnet} magnet
 * @param {!string} outputDir
 */
function serveSassFiles(magnet, outputDir) {
  if (!isServingSassFiles) {
    magnet.getServer()
      .getEngine()
      .use('/css', express.static(outputDir));
  }
  isServingSassFiles = true;
}

/**
 * Gets the output file path for a file and a given
 * output directory.
 * @param {!string} file
 * @param {!string} outputDir
 * @return {!string}
 */
function getOutputFile(file, outputDir) {
  const fileName = path.basename(file).replace('.scss', '.css');
  return path.join(outputDir, fileName);
}

/**
 * Writes css to file
 * @param {!string} file
 * @param {!string} css
 * @return {!Promise}
 */
function writeFile(file, css) {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, css, err => {
      if (err) {
        return reject(err);
      }
      resolve();
    })
  });
}

/**
 * Renders a single sass file
 * @param {!string} file
 * @param {!object} config
 * @return {!Promise.<string>} The resulting css
 */
function renderFile(file, config) {
  const options = Object.assign({file}, config);

  return new Promise((resolve, reject) => {
    sass.render(options, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result.css);
    });
  });
}

/**
 * Builds sass files to output dir
 * @param {!Array.<string>} files
 * @param {!string} outputDir
 * @param {!Object} config
 * @return {!Promise}
 */
async function buildSassFiles(files, outputDir, config) {
  const renderedFiles = await Promise.all(files.map(async file => {
    const css = await renderFile(file, config);
    return {file, css};
  }));

  await fs.ensureDir(outputDir);

  return Promise.all(renderedFiles.map(({file, css}) => {
    const outputFile = getOutputFile(file, outputDir);
    return writeFile(outputFile, css);
  }));
}

export default {
  async build(magnet) {
    const config = magnet.getConfig().magnet.pluginsConfig.sass;

    let files = config.src || [];
    if (!Array.isArray(files)) {
      files = [files];
    }

    if (!files.length) {
      return;
    }

    const outputDir = path.join(magnet.getDirectory(), sassDir);

    try {
      await buildSassFiles(files, outputDir, config);
    } catch(err) {
      throw new Error(`Something went wrong compiling your stylesheets:\n${err.message}`);
    }
  },

  start(magnet) {
    const outputDir = path.join(magnet.getDirectory(), sassDir);
    serveSassFiles(magnet, outputDir);
  },

  test() {
    return false;
  }
}
