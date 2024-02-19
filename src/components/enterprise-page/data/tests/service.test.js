/* eslint-disable import/no-extraneous-dependencies */
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import * as service from '../service';

jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedHttpClient: jest.fn(),
}));

const configuration = getConfig();
const lmsBaseUrl = `${configuration.LMS_BASE_URL}`;
const mockEnterpriseUUID = 'test-enterprise-id';
const mockUsername = 'test_username';

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

axiosMock.onAny().reply(200);
axios.post = jest.fn();
axios.get = jest.fn();

describe('service', () => {
  test('updateUserActiveEnterprise calls the LMS to update the active linked enterprise org', () => {
    service.updateUserActiveEnterprise(
      mockEnterpriseUUID,
    );
    const expectedFormData = new FormData();
    expectedFormData.append('enterprise', mockEnterpriseUUID);
    expect(axios.post).toBeCalledWith(
      `${lmsBaseUrl}/enterprise/select/active/`,
      expectedFormData,
    );
  });
  test('fetchEnterpriseLearnerData returns the actively linked enterprise', async () => {
    axios.get.mockReturnValue({
      data: {
        results: [{
          active: true,
          enterpriseCustomer: { uuid: 'test-uuid' },
        }],
      },
    });
    const linkedCustomer = await service.fetchEnterpriseLearnerData(mockUsername);
    expect(linkedCustomer[0].enterpriseCustomer).toEqual({ uuid: 'test-uuid' });
  });
});
