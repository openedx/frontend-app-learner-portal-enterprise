import { MockFactory } from './MockFactory';
import { resolveFactoryValue, cloneMock } from './utils';

export class ObjectFactory extends MockFactory {
  constructor(template) {
    super();

    // so if you pass other factory, it won't mutate it's state on creation
    this.template = {};
    Object.entries(template).forEach(([key, item]) => {
      this.template[key] = cloneMock(item);
    });
  }

  clone() {
    return new this.constructor(this.template);
  }

  create(mixin) {
    const result = {};

    const resolveTemplate = (template) => (
      Object.entries(template).forEach(([key, item]) => {
        result[key] = resolveFactoryValue(item);
      })
    );

    resolveTemplate(this.template);

    if (mixin) {
      const usedMixin = mixin instanceof ObjectFactory
        ? mixin.create()
        : mixin;

      resolveTemplate(usedMixin);
    }

    return result;
  }

  extend(mixin) {
    const mixinTemplate = mixin instanceof ObjectFactory
      ? mixin.template
      : mixin;
    return new this.constructor({ ...this.template, ...mixinTemplate });
  }
}
