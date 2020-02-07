import { markCourseAsCompleteRequest } from '../service';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

apiClient.patch = jest.fn();

describe('mark complete modal service', () => {
  const url = 'http://localhost:18000/enterprise_learner_portal/api/v1/enterprise_course_enrollments/';

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('calls apiClient patch with no parameters', () => {
    markCourseAsCompleteRequest();
    expect(apiClient.patch).toBeCalledWith(url);
  });

  it('calls apiClient patch with parameters', () => {
    markCourseAsCompleteRequest({
      course_id: 'test-course-id',
      enterprise_id: 'test-enterprise-id',
    });
    expect(apiClient.patch).toBeCalledWith(`${url}?course_id=test-course-id&enterprise_id=test-enterprise-id`);
  });
});
