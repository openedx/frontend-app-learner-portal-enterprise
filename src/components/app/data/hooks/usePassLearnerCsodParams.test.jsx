import { renderHook } from '@testing-library/react';
import { useLocation, useParams } from 'react-router-dom';

import { enterpriseCustomerFactory } from '../services/data/__factories__';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { updateUserCsodParams } from '../services';
import usePassLearnerCsodParams from './usePassLearnerCsodParams';

jest.mock('./useEnterpriseCustomer');
jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  updateUserCsodParams: jest.fn().mockResolvedValue(null),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useLocation: jest.fn(),
}));
const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockedUserGuid = 'test-guid';
const mockedSessionToken = 'test-token';
const mockedCallbackUrl = 'mock-url';
const mockedSubdomain = 'test-subdomain';
const mockedSearchString = new URLSearchParams(`?userGuid=${mockedUserGuid}&sessionToken=${mockedSessionToken}&callbackUrl=${mockedCallbackUrl}&subdomain=${mockedSubdomain}`);

describe('usePassLearnerCsodParams', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useLocation.mockReturnValue({
      search: mockedSearchString,
    });
  });
  it('should call performCsodParamsUpdate with expected data', () => {
    useParams.mockReturnValue({ courseKey: 'edX+DemoX' });
    renderHook(() => usePassLearnerCsodParams());
    expect(updateUserCsodParams).toHaveBeenCalledTimes(1);
    expect(updateUserCsodParams).toHaveBeenCalledWith(
      {
        data: {
          enterpriseUUID: mockEnterpriseCustomer.uuid,
          userGuid: mockedUserGuid,
          sessionToken: mockedSessionToken,
          callbackUrl: mockedCallbackUrl,
          subdomain: mockedSubdomain,
          courseKey: 'edX+DemoX',
        },
      },
    );
  });
  it.each([
    {
      courseKey: 'edX+DemoX',
      userGuid: `?userGuid=${mockedUserGuid}`,
      sessionToken: null,
    },
    {
      courseKey: 'edX+DemoX',
      userGuid: null,
      sessionToken: `?sessionToken=${mockedSessionToken}`,
    },
    {
      courseKey: null,
      userGuid: `?userGuid=${mockedUserGuid}`,
      sessionToken: `&sessionToken=${mockedSessionToken}`,
    },
    {
      courseKey: null,
      userGuid: null,
      sessionToken: null,
    },
  ])('should not call Csod params if params are missing', ({
    courseKey,
    userGuid,
    sessionToken,
  }) => {
    let updatedSearchString = `?callbackUrl=${mockedCallbackUrl}&subdomain=${mockedSubdomain}`;
    if (userGuid || sessionToken) {
      updatedSearchString = `${mockedUserGuid}${mockedSessionToken}&callbackUrl=${mockedCallbackUrl}&subdomain=${mockedSubdomain}`;
    }
    updatedSearchString = new URLSearchParams(updatedSearchString);
    useLocation.mockReturnValue({
      search: updatedSearchString,
    });
    if (courseKey) {
      useParams.mockReturnValue({ courseKey });
    }
    renderHook(() => usePassLearnerCsodParams());

    expect(updateUserCsodParams).not.toHaveBeenCalled();
  });
});
