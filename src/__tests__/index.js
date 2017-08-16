jest
  .mock('fs')
  .mock('node-sass');

import * as sass from 'node-sass';
import fs from 'fs';
import plugin from '../index';

describe('magnet-plugin-sass', () => {
  let magnet;

  beforeEach(() => {
    jest.clearAllMocks();
    fs.writeFile.mockImplementation((file, content, cb) => cb());

    const engine = {
      use: jest.fn()
    };

    const server = {
      getEngine: jest.fn(() => engine)
    };

    magnet = {
      getServer: jest.fn(() => server),
      getConfig: jest.fn(() => ({
        magnet: {
          pluginsConfig: {
            sass: {
              src: 'test/some_styles.scss',
              includePaths: [
                'foo/bar'
              ]
            }
          }
        }
      })),
      getDirectory: jest.fn(() => 'test/dir')
    };
  });

  it('should export an object', () => {
    expect(plugin).toBeInstanceOf(Object);
  });

  it('should export build and test methods', () => {
    expect(plugin.build).toBeInstanceOf(Function);
    expect(plugin.test).toBeInstanceOf(Function);
    expect(plugin.start).toBeInstanceOf(Function);
  });

  it('should return false for all modules', () => {
    expect(plugin.test()).toBe(false);
  });

  it('should build a single css file', async () => {
    await plugin.build(magnet);

    expect(fs.writeFile).toHaveBeenCalled();
    expect(sass.render).toHaveBeenCalled();
  });

  it('should allow for multiple css files', async () => {
    expect(fs.writeFile).not.toHaveBeenCalled();
    expect(sass.render).not.toHaveBeenCalled();

    magnet.getConfig.mockImplementation(() => ({
      magnet: {
        pluginsConfig: {
          sass: {
            src: [
              'test/file_one.scss',
              'test/file_two.scss'
            ]
          }
        }
      }
    }));
    await plugin.build(magnet);

    expect(fs.writeFile).toHaveBeenCalledTimes(2);
    expect(sass.render).toHaveBeenCalledTimes(2);
  });

  it('should mount satic middleware on start', async () => {
    const spy = magnet.getServer().getEngine().use;

    expect(spy).not.toHaveBeenCalled();
    await plugin.start(magnet);
    expect(spy).toHaveBeenCalled();
  });

  it('should throw an Error if build fails', () => {
    fs.writeFile.mockImplementation(() => {
      throw new Error()
    });

    return expect(plugin.build(magnet)).rejects.toBeInstanceOf(Error);
  });

  it('should pass other options to sass compiler', async () => {
    await plugin.build(magnet);

    expect(fs.writeFile).toHaveBeenCalled();
    expect(sass.render).toHaveBeenCalled();

    expect(sass.render.mock.calls[0][0].includePaths).toEqual(['foo/bar']);
  });
});
