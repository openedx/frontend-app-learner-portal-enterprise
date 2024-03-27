import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { mergeConfig } from '@edx/frontend-platform/config';

import {
  acknowledgeContentAssignments,
  fetchEnterpriseCourseEnrollments,
} from '../service';

jest.mock('@edx/frontend-platform/auth');
const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);
axiosMock.onAny().reply(200);
axios.get = jest.fn();
axios.post = jest.fn();

describe('course enrollments service', () => {
  beforeEach(() => {
    mergeConfig({
      LMS_BASE_URL: process.env.LMS_BASE_URL,
      ENTERPRISE_ACCESS_BASE_URL: process.env.ENTERPRISE_ACCESS_BASE_URL,
    });
  });

  it('fetches enterprise enrollments', () => {
    const url = 'http://localhost:18000/enterprise_learner_portal/api/v1/enterprise_course_enrollments/?enterprise_id=test-enterprise-id&is_active=true';
    fetchEnterpriseCourseEnrollments('test-enterprise-id');
    expect(axios.get).toHaveBeenCalledWith(url);
  });

  it('acknowledges specified content assignments', () => {
    const url = 'http://enterprise-access.url/api/v1/assignment-configurations/test-assignment-configuration-id/acknowledge-assignments/';
    const assignmentIds = ['test-assignment-id-1', 'test-assignment-id-2'];
    const assignmentConfigurationId = 'test-assignment-configuration-id';
    const expectedPayload = {
      assignment_uuids: assignmentIds,
    };
    acknowledgeContentAssignments({
      assignmentConfigurationId,
      assignmentIds,
    });
    expect(axios.post).toBeCalledWith(url, expectedPayload);
  });
});
