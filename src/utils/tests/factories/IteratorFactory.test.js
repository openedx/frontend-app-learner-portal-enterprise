import { IteratorFactory } from './IteratorFactory';
import { CloneTestFactory, TestMockFactory } from './testFactories';
import { createManyMocks } from './utils';
import { EmptyIteratorFactoryError } from './errors';

describe('IteratorFactory', () => {
  test('Starting over if ran out of elements', () => {
    const iterable = [1, 2, 3];

    const factory = new IteratorFactory(iterable);

    const result = createManyMocks(iterable.length * 3, factory);

    expect(result).toEqual([
      ...iterable,
      ...iterable,
      ...iterable,
    ]);
  });

  test('Fill in the rest with factory', () => {
    const iterable = [1, 2, 3];

    const factory = new IteratorFactory(iterable, new TestMockFactory());

    const result = createManyMocks(iterable.length + 2, factory);

    expect(result).toEqual([
      ...iterable,
      TestMockFactory.OUTPUT,
      TestMockFactory.OUTPUT,
    ]);
  });

  test('Empty iterator error', () => {
    const factory = new IteratorFactory([]);
    expect.assertions(1);
    try {
      factory.create();
    } catch (error) {
      expect(error).toBeInstanceOf(EmptyIteratorFactoryError);
    }
  });

  test('Clone is independent from original', () => {
    const iterable = [1, 2];
    const expectedResult = [
      ...iterable,
      CloneTestFactory.NOT_USED,
    ];

    const factory = new IteratorFactory(iterable, new CloneTestFactory());
    const clone = factory.clone();

    const length = iterable.length + 1;
    const factoryResult = createManyMocks(length, factory);

    expect(factoryResult).toEqual(expectedResult);

    expect(factoryResult).toEqual(createManyMocks(length, clone));
  });
});
