import { MockFactory } from '../MockFactory';

export class CloneTestFactory extends MockFactory {
  static USED = 'used'

  static NOT_USED = 'not_used'

  constructor() {
    super();
    this.output = this.constructor.NOT_USED;
  }

  create() {
    const { output } = this;
    this.output = this.constructor.USED;
    return output;
  }

  clone() {
    return new this.constructor();
  }
}
