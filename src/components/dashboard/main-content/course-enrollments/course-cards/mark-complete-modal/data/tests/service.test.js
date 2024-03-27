import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { mergeConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { updateCourseCompleteStatusRequest, ENROLL_ENDPOINT } from '../service';

jest.mock('@edx/frontend-platform/auth');
const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);
axiosMock.onAny().reply(200);
axios.patch = jest.fn();

describe('mark complete modal service', () => {
  const url = `${process.env.LMS_BASE_URL}${ENROLL_ENDPOINT}`;

  beforeEach(() => {
    mergeConfig({
      LMS_BASE_URL: process.env.LMS_BASE_URL,
    });
  });

  it('calls apiClient patch with no parameters', () => {
    updateCourseCompleteStatusRequest();
    expect(axios.patch).toHaveBeenCalledWith(url);
  });

  it('calls apiClient patch with parameters', () => {
    updateCourseCompleteStatusRequest({
      course_id: 'test-course-id',
      enterprise_id: 'test-enterprise-id',
    });
    expect(axios.patch).toHaveBeenCalledWith(`${url}?course_id=test-course-id&enterprise_id=test-enterprise-id`);
  });
});
