import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { markCourseAsCompleteRequest } from '../service';

jest.mock('@edx/frontend-platform/auth');
const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);
axiosMock.onAny().reply(200);
axios.patch = jest.fn();

describe('mark complete modal service', () => {
  const url = 'http://localhost:18000/enterprise_learner_portal/api/v1/enterprise_course_enrollments/';

  it('calls apiClient patch with no parameters', () => {
    markCourseAsCompleteRequest();
    expect(axios.patch).toBeCalledWith(url);
  });

  it('calls apiClient patch with parameters', () => {
    markCourseAsCompleteRequest({
      course_id: 'test-course-id',
      enterprise_id: 'test-enterprise-id',
    });
    expect(axios.patch).toBeCalledWith(`${url}?course_id=test-course-id&enterprise_id=test-enterprise-id`);
  });
});
