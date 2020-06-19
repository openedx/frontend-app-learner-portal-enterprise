import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { updateCourseCompleteStatusRequest, ENROLL_ENDPOINT } from '../service';

jest.mock('@edx/frontend-platform/auth');
const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);
axiosMock.onAny().reply(200);
axios.patch = jest.fn();

describe('mark complete modal service', () => {
  const url = `${process.env.LMS_BASE_URL}${ENROLL_ENDPOINT}`;

  it('calls apiClient patch with no parameters', () => {
    updateCourseCompleteStatusRequest();
    expect(axios.patch).toBeCalledWith(url);
  });

  it('calls apiClient patch with parameters', () => {
    updateCourseCompleteStatusRequest({
      course_id: 'test-course-id',
      enterprise_id: 'test-enterprise-id',
    });
    expect(axios.patch).toBeCalledWith(`${url}?course_id=test-course-id&enterprise_id=test-enterprise-id`);
  });
});
