import {
  cloneMock, createManyMocks, getIterator, resolveFactoryValue,
} from './utils';
import { MockFactory } from './MockFactory';

class TestMockFactory extends MockFactory {
  static OUTPUT = 'factory_output';

  static CLONE = 'Clone';

  create() {
    return this.constructor.OUTPUT;
  }

  clone() {
    return this.constructor.CLONE;
  }
}

describe('resolveFactoryValue', () => {
  test('Regular value', () => {
    const input = 'input';
    expect(resolveFactoryValue(input)).toBe(input);
  });

  test('Factory', () => {
    const factory = new TestMockFactory();
    expect(resolveFactoryValue(factory)).toBe(TestMockFactory.OUTPUT);
  });
});

describe('createManyMocks', () => {
  const factory = new TestMockFactory();

  test('Empty', () => {
    expect(createManyMocks(0, factory)).toEqual([]);
  });

  test('Three items', () => {
    expect(createManyMocks(3, factory)).toEqual([
      TestMockFactory.OUTPUT,
      TestMockFactory.OUTPUT,
      TestMockFactory.OUTPUT,
    ]);
  });
});

describe('getIterator', () => {
  test('From array', () => {
    const first = 1;
    const last = 2;
    const list = [first, last];

    const expectIteratorToWork = (iterator) => {
      expect(iterator.next()).toEqual({ value: first, done: false });
      expect(iterator.next()).toEqual({ value: last, done: false });
      expect(iterator.next()).toEqual({ done: true });
    };

    expectIteratorToWork(getIterator(list));
    expectIteratorToWork(getIterator(list));
  });
});

describe('cloneMock', () => {
  test('Clone factory', () => {
    const factory = new TestMockFactory();

    expect(cloneMock(factory)).toBe(TestMockFactory.CLONE);
  });

  test('Clone array', () => {
    const array = [1, 2, 3];
    const clone = cloneMock(array);

    expect(array).not.toBe(clone);
    expect(array).toEqual(clone);
  });

  test('Clone object', () => {
    const object = { id: 1, name: 'John' };
    const clone = cloneMock(object);

    expect(object).not.toBe(clone);
    expect(object).toEqual(clone);
  });

  test('Clone primitive', () => {
    const string = 'Hello world';

    expect(string).toBe(cloneMock(string));
  });
});
