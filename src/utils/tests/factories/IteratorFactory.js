import { MockFactory } from './MockFactory';
import { cloneMock, getIterator, resolveFactoryValue } from './utils';
import { EmptyIteratorFactoryError } from './errors';

export class IteratorFactory extends MockFactory {
  constructor(iterable, fillFactory) {
    super();

    this.iterable = iterable;
    this.iterator = getIterator(this.iterable);
    this.isFillingTheRest = false;
    this.fillFactory = fillFactory !== undefined
      ? cloneMock(fillFactory)
      : undefined;
  }

  clone() {
    return new this.constructor(this.iterable, this.fillFactory);
  }

  restartIterationAndGetFirst() {
    this.iterator = getIterator(this.iterable);
    const { done, value } = this.iterator.next();

    if (done) {
      throw new EmptyIteratorFactoryError();
    }

    return value;
  }

  create() {
    if (this.isFillingTheRest) {
      return resolveFactoryValue(this.fillFactory);
    }

    const { done, value } = this.iterator.next();

    if (!done) {
      return value;
    }

    if (this.fillFactory !== undefined) {
      this.isFillingTheRest = true;
      return resolveFactoryValue(this.fillFactory);
    }

    return this.restartIterationAndGetFirst();
  }
}
