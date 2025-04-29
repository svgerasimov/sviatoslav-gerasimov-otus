import { jest } from '@jest/globals';
import { displayTree } from '../index.js';

describe('displayTree()', () => {
  let logSpy;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('печатает структуру дерева в правильном порядке', () => {
    const tree = {
      name: '1',
      items: [
        { name: '2', items: [{ name: '3' }, { name: '4' }] },
        { name: '5', items: [{ name: '6' }] },
      ],
    };

    displayTree(tree);

    expect(logSpy).toHaveBeenCalledTimes(6);

    expect(logSpy).toHaveBeenNthCalledWith(1, '1');
    expect(logSpy).toHaveBeenNthCalledWith(2, '├── 2');
    expect(logSpy).toHaveBeenNthCalledWith(3, '│   ├── 3');
    expect(logSpy).toHaveBeenNthCalledWith(4, '│   └── 4');
    expect(logSpy).toHaveBeenNthCalledWith(5, '└── 5');
    expect(logSpy).toHaveBeenNthCalledWith(6, '    └── 6');
  });
});
