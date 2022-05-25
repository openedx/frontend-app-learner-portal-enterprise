import { TestMockFactory, CloneTestFactory } from './testFactories';
import { ListFactory } from './ListFactory';
import { createManyMocks } from './utils';

describe('ListFactory', () => {
  const threeMocks = [
    TestMockFactory.OUTPUT,
    TestMockFactory.OUTPUT,
    TestMockFactory.OUTPUT,
  ];

  test('Three items', () => {
    const factory = new ListFactory(3, new TestMockFactory());

    expect(factory.create()).toEqual(threeMocks);
  });

  test('Empty', () => {
    const factory = new ListFactory(0, new TestMockFactory());

    expect(factory.create()).toEqual([]);
  });

  test('Dynamic length', () => {
    const lengths = [3, 0];
    let currentLengthIndex = 0;
    const getLength = () => {
      const result = lengths[currentLengthIndex];
      currentLengthIndex++;
      return result;
    };

    const factory = new ListFactory(getLength, new TestMockFactory());

    expect(createManyMocks(2, factory)).toEqual([
      threeMocks,
      [],
    ]);
  });

  test('Clone is independent from original', () => {
    const expectedResult = [
      CloneTestFactory.NOT_USED,
      // it uses the same instance of factory for each iteration
      // but it must not share instance with the copy
      CloneTestFactory.USED,
    ];

    const factory = new ListFactory(2, new CloneTestFactory());
    const clone = factory.clone();

    const factoryResult = factory.create();

    expect(factoryResult).toEqual(expectedResult);
    expect(factoryResult).toEqual(clone.create());
  });
});
