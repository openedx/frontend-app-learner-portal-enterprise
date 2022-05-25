import { MockFactory } from '../MockFactory';

export class TestPassValueFactory extends MockFactory {
  constructor(value) {
    super();
    this.value = value;
  }

  clone() {
    return new this.constructor(this.value);
  }

  create() {
    return this.value;
  }
}
