import { MockFactory } from '../MockFactory';

export class TestMockFactory extends MockFactory {
  static OUTPUT = 'factory_output';

  create() {
    return this.constructor.OUTPUT;
  }
}
