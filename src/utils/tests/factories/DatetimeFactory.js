import moment from 'moment';

import { MockFactory } from './MockFactory';

export class DatetimeFactory extends MockFactory {
  index = 0;

  constructor(startingAt, options) {
    super();
    this.increment = options.increment;
    this.decrement = options.decrement;
    this.format = options.format;
    this.startingAt = moment(startingAt);
    this.currentDateTime = moment(startingAt);
  }

  clone() {
    return new this.constructor(this.startingAt, {
      increment: this.increment,
      decrement: this.decrement,
      format: this.format,
    });
  }

  create() {
    const result = this.currentDateTime.format(this.format);

    if (this.increment) {
      this.currentDateTime.add(this.increment);
    }

    if (this.decrement) {
      this.currentDateTime.subtract(this.decrement);
    }

    return result;
  }
}
