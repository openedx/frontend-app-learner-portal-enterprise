import { TestPassValueFactory, CloneTestFactory } from './testFactories';
import { ObjectFactory } from './ObjectFactory';

describe('ObjectFactory', () => {
  test('Create without mixin', () => {
    const testFactoryValue = 'test';
    const factory = new ObjectFactory({
      id: 1,
      test: new TestPassValueFactory(testFactoryValue),
    });

    expect(factory.create()).toEqual({ id: 1, test: testFactoryValue });
  });

  describe('Mixins', () => {
    const template = {
      id: 1,
      test: new TestPassValueFactory('old'),
      notUsed: new CloneTestFactory(),
    };

    const mixin = {
      test: new TestPassValueFactory('new'),
      name: 'hello',
    };

    const expectedResult = {
      id: template.id,
      test: mixin.test.value,
      name: mixin.name,
      notUsed: CloneTestFactory.NOT_USED,
    };

    test('Create with mixin', () => {
      const factory = new ObjectFactory(template);

      expect(factory.create(mixin)).toEqual(expectedResult);
    });

    test('Create with factory mixin', () => {
      const factory = new ObjectFactory(template);

      const mixinFactory = new ObjectFactory(mixin);

      expect(factory.create(mixinFactory)).toEqual(expectedResult);
    });

    test('Extend', () => {
      const factory = new ObjectFactory(template);

      const mixinFactory = new ObjectFactory(mixin);

      const extendedFactory = factory.extend(mixinFactory);

      expect(extendedFactory.create()).toEqual(expectedResult);
    });

    test('Extend from non factory', () => {
      const factory = new ObjectFactory(template);

      const extendedFactory = factory.extend(mixin);

      expect(extendedFactory.create()).toEqual(expectedResult);
    });
  });

  test('Clone is independent from original', () => {
    const factory = new ObjectFactory({
      id: 1,
      notUsed: new CloneTestFactory(),
    });
    const clone = factory.clone();

    const factoryResult = factory.create();

    expect(factoryResult).toEqual({
      id: 1,
      notUsed: CloneTestFactory.NOT_USED,
    });
    expect(factoryResult).toEqual(clone.create());
  });
});
