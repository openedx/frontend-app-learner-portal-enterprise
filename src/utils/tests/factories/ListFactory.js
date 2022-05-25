import { MockFactory } from './MockFactory';
import { createManyMocks } from './utils';

export class ListFactory extends MockFactory {
  constructor(length, itemFactory) {
    super();

    this.getLength = typeof length === 'function'
      ? length
      : () => length;

    this.itemFactory = itemFactory.clone();
  }

  clone() {
    return new this.constructor(this.getLength, this.itemFactory);
  }

  create() {
    return createManyMocks(this.getLength(), this.itemFactory);
  }
}
