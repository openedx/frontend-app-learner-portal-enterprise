import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { mergeConfig } from '@edx/frontend-platform/config';

import {
  postLicenseRequest,
  postCouponCodeRequest,
} from '../service';

jest.mock('@edx/frontend-platform/auth');
const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

axiosMock.onAny().reply(200);
axios.get = jest.fn();
axios.post = jest.fn();
const enterpriseAccessBaseUrl = `${process.env.ENTERPRISE_ACCESS_BASE_URL}`;
const mockEnterpriseUUID = 'test-enterprise-id';
const mockCourseId = 'test-course-id';

describe('postCouponCodeRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mergeConfig({
      ENTERPRISE_ACCESS_BASE_URL: enterpriseAccessBaseUrl,
    });
  });

  it('posts coupon code request for the given enterprise and course', () => {
    postCouponCodeRequest(mockEnterpriseUUID, mockCourseId);
    const options = {
      enterprise_customer_uuid: mockEnterpriseUUID,
      course_id: mockCourseId,
    };
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(`${enterpriseAccessBaseUrl}/api/v1/coupon-code-requests/`, options);
  });
});

describe('postLicenseRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mergeConfig({
      ENTERPRISE_ACCESS_BASE_URL: enterpriseAccessBaseUrl,
    });
  });

  it('posts license request for the given enterprise and course', () => {
    postLicenseRequest(mockEnterpriseUUID, mockCourseId);
    const options = {
      enterprise_customer_uuid: mockEnterpriseUUID,
      course_id: mockCourseId,
    };
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(`${enterpriseAccessBaseUrl}/api/v1/license-requests/`, options);
  });
});
