import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker'; // eslint-disable-line import/no-extraneous-dependencies
import { camelCaseObject } from '@edx/frontend-platform';
import { v4 as uuidv4 } from 'uuid';

Factory.define('academy')
  .attr('uuid', uuidv4())
  .attr('title', faker.lorem.words())
  .attr('short_description', faker.lorem.sentence(50))
  .attr('long_description', faker.lorem.sentence(20))
  .attr('image', faker.image.urlPlaceholder())
  .attr('tags', []);

export function academyFactory(overrides = {}) {
  return camelCaseObject(Factory.build('academy', overrides));
}

export function academiesFactory(count = 1, overrides = {}) {
  return Array.from({ length: count }, () => academyFactory(overrides));
}
