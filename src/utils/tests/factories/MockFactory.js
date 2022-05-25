export class MockFactory {
  create() {
    return null;
  }

  clone() {
    return new this.constructor();
  }
}
