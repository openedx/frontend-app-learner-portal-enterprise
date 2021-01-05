import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import {
  fetchEnterpriseCourseEnrollments,
} from '../service';

jest.mock('@edx/frontend-platform/auth');
const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);
axiosMock.onAny().reply(200);
axios.get = jest.fn();

describe('course enrollments service', () => {
  it('fetches enterprise enrollments', () => {
    const url = 'http://localhost:18000/enterprise_learner_portal/api/v1/enterprise_course_enrollments/?enterprise_id=test-enterprise-id&is_active=true';
    fetchEnterpriseCourseEnrollments('test-enterprise-id');
    expect(axios.get).toBeCalledWith(url);
  });
});
