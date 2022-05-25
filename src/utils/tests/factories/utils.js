import { MockFactory } from './MockFactory';

export const randomIntFn = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const resolveFactoryValue = (item) => (
  item instanceof MockFactory ? item.create() : item
);

export const cloneMock = (item) => {
  if (item instanceof MockFactory) {
    return item.clone();
  }

  if (Array.isArray(item)) {
    return [...item];
  }

  if (typeof item === 'object') {
    return { ...item };
  }
  return item;
};

export const createManyMocks = (length, factory) => (
  Array.from({ length }, () => factory.create())
);

export const getIterator = (iterable) => iterable[Symbol.iterator]();
