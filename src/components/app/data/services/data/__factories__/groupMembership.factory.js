import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker'; // eslint-disable-line import/no-extraneous-dependencies
import { camelCaseObject } from '@edx/frontend-platform';
import { v4 as uuidv4 } from 'uuid';

Factory.define('groupMembership')
  .attr('groupUuid', uuidv4())
  .attr('enterpriseCatalog', {
    catalogContentCount: 3,
    catalogUuid: uuidv4(),
  })
  .attr('enterpriseGroupMembershipUuid', uuidv4)
  .attr('learnerId', 1)
  .attr('membershipDetails', {
    userEmail: faker.internet.email(),
    userName: faker.lorem.words(),
  })
  .attr('pendingLearnerId', null)
  .attr('status', 'accepted');

export function groupMembershipFactory(overrides = {}) {
  return camelCaseObject(Factory.build('groupMembership', overrides));
}

export function groupMembershipFactories(count = 1, overrides = {}) {
  return Array.from({ length: count }, () => groupMembershipFactory(overrides));
}
