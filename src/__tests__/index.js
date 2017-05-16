import plugin from '../index';

describe('magnet-plugin-sass', () => {
  it('should export an object', () => {
    expect(plugin).toBeInstanceOf(Object);
  });

  it('should export build and test methods', () => {
    expect(plugin.build).toBeInstanceOf(Function);
    expect(plugin.test).toBeInstanceOf(Function);
  });

  it('should return false for all modules', () => {
    expect(plugin.test()).toBe(false);
  });
});
