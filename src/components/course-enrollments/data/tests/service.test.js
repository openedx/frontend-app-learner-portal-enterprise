import {
  fetchProgramCourseEnrollments,
  fetchEnterpriseCourseEnrollments,
} from '../service';
import apiClient from '../../../../apiClient';

apiClient.get = jest.fn();

describe('course enrollments service', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('fetches program enrollments', () => {
    const url = 'http://localhost:18000/api/program_enrollments/v1/programs/test-program-id/overview/';
    fetchProgramCourseEnrollments('test-program-id');
    expect(apiClient.get).toBeCalledWith(url);
  });

  it('fetches enterprise enrollments', () => {
    const url = 'http://localhost:18000/enterprise_learner_portal/api/v1/enterprise_course_enrollments/?enterprise_id=test-enterprise-id';
    fetchEnterpriseCourseEnrollments('test-enterprise-id');
    expect(apiClient.get).toBeCalledWith(url);
  });
});
