
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import {
  fetchProgramCourseEnrollments,
  fetchEnterpriseCourseEnrollments,
} from '../service';

jest.mock('@edx/frontend-platform/auth');
const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);
axiosMock.onAny().reply(200);
axios.get = jest.fn();

describe('course enrollments service', () => {
  it('fetches program enrollments', () => {
    const url = 'http://localhost:18000/api/program_enrollments/v1/programs/test-program-id/overview/';
    fetchProgramCourseEnrollments('test-program-id');
    expect(axios.get).toBeCalledWith(url);
  });

  it('fetches enterprise enrollments', () => {
    const url = 'http://localhost:18000/enterprise_learner_portal/api/v1/enterprise_course_enrollments/?enterprise_id=test-enterprise-id';
    fetchEnterpriseCourseEnrollments('test-enterprise-id');
    expect(axios.get).toBeCalledWith(url);
  });
});
