import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker'; // eslint-disable-line import/no-extraneous-dependencies
import dayjs from 'dayjs';
import { camelCaseObject } from '@edx/frontend-platform';
import { v4 as uuidv4 } from 'uuid';
import { COURSE_STATUSES } from '../../../../../../constants';

Factory.define('authenticatedUser')
  .attr('userId', 3)
  .attr('email', faker.internet.email())
  .attr('username', faker.internet.userName())
  .attr('name', faker.person.fullName())
  .attr('roles', []);
export function authenticatedUserFactory(overrides = {}) {
  return camelCaseObject(Factory.build('authenticatedUser', overrides));
}

Factory.define('enterpriseCustomer')
  .attr('active', true)
  .attr('created', dayjs().toISOString())
  .attr('uuid', uuidv4())
  .attr('auth_org_id', uuidv4())
  .attr('slug', faker.lorem.slug())
  .attr('name', faker.company.name())
  .attr('contact_email', faker.internet.email())
  .attr('hide_labor_market_data', false)
  .attr('hide_original_course_price', false)
  .attr('enable_learner_portal', true)
  .attr('enable_data_sharing_consent', true)
  .attr('disable_expiry_messaging_for_learner_credit', false)
  .attr('admin_users', [{ email: faker.internet.email() }])
  .attr('disable_search', false)
  .attr('enable_one_academy', false)
  .attr('branding_configuration', {
    logo: faker.image.urlPlaceholder(),
    primary_color: faker.internet.color(),
    secondary_color: faker.internet.color(),
    tertiary_color: faker.internet.color(),
  });
export function enterpriseCustomerFactory(overrides = {}) {
  return camelCaseObject(Factory.build('enterpriseCustomer', overrides));
}

Factory.define('enterpriseCustomerUser')
  .attr('active', true)
  .attr('created', dayjs().toISOString())
  .attr('data_sharing_consent_records', [])
  .attr('user', Factory.build('authenticatedUser'))
  .attr('enterprise_customer', Factory.build('enterpriseCustomer'));
export function enterpriseCustomerUserFactory(overrides = {}) {
  return camelCaseObject(Factory.build('enterpriseCustomerUser', overrides));
}

Factory.define('enterpriseCourseEnrollment')
  .attr('uuid', uuidv4())
  .attr('course_run_id', 'course-v1:edX+DemoX+Demo')
  .attr('display_name', faker.lorem.words())
  .attr('course_run_status', COURSE_STATUSES.inProgress)
  .attr('course_run_url', faker.internet.url())
  .attr('resume_course_run_url', faker.internet.url())
  .attr('start_date', dayjs().subtract(1, 'month').toISOString())
  .attr('end_date', dayjs().add(1, 'month').toISOString())
  .attr('enroll_by', dayjs().add(7, 'day').toISOString());
export function enterpriseCourseEnrollmentFactory(overrides = {}) {
  return camelCaseObject(Factory.build('enterpriseCourseEnrollment', overrides));
}
