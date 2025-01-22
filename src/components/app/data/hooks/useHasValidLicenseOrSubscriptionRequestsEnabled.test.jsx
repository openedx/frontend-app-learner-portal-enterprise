import { renderHook } from '@testing-library/react-hooks';
import useHasValidLicenseOrSubscriptionRequestsEnabled from './useHasValidLicenseOrSubscriptionRequestsEnabled';
import { LICENSE_STATUS } from '../../../enterprise-user-subsidy/data/constants';
import { SUBSIDY_TYPE } from '../../../../constants';
import { useBrowseAndRequestConfiguration } from './useBrowseAndRequest';
import useSubscriptions from './useSubscriptions';

jest.mock('./useBrowseAndRequest');
jest.mock('./useSubscriptions');

describe('useHasValidLicenseOrSubscriptionRequestsEnabled', () => {
  it('should return true when the subscription license is activated and current', () => {
    useSubscriptions.mockReturnValue({
      data: {
        subscriptionLicense: {
          status: LICENSE_STATUS.ACTIVATED,
          subscriptionPlan: {
            isCurrent: true,
          },
        },
      },
    });
    useBrowseAndRequestConfiguration.mockReturnValue({
      data: {
        subsidyRequestsEnabled: false,
        subsidyType: SUBSIDY_TYPE.LICENSE,
      },
    });

    const { result } = renderHook(() => useHasValidLicenseOrSubscriptionRequestsEnabled());
    expect(result.current).toBe(true);
  });

  it('should return true when subsidy requests are enabled for subscriptions', () => {
    useSubscriptions.mockReturnValue({
      data: {
        subscriptionLicense: {
          status: LICENSE_STATUS.REVOKED,
          subscriptionPlan: {
            isCurrent: false,
          },
        },
      },
    });
    useBrowseAndRequestConfiguration.mockReturnValue({
      data: {
        subsidyRequestsEnabled: true,
        subsidyType: SUBSIDY_TYPE.LICENSE,
      },
    });

    const { result } = renderHook(() => useHasValidLicenseOrSubscriptionRequestsEnabled());
    expect(result.current).toBe(true);
  });

  it('should return false when the subscription license is not activated and not current, and subsidy requests are not enabled', () => {
    useSubscriptions.mockReturnValue({
      data: {
        subscriptionLicense: {
          status: LICENSE_STATUS.REVOKED,
          subscriptionPlan: {
            isCurrent: false,
          },
        },
      },
    });
    useBrowseAndRequestConfiguration.mockReturnValue({
      data: {
        subsidyRequestsEnabled: false,
        subsidyType: SUBSIDY_TYPE.LICENSE,
      },
    });

    const { result } = renderHook(() => useHasValidLicenseOrSubscriptionRequestsEnabled());
    expect(result.current).toBe(false);
  });

  it('should return false when subscriptionLicense is undefined and subsidy requests are not enabled', () => {
    useSubscriptions.mockReturnValue({
      data: {
        subscriptionLicense: undefined,
      },
    });
    useBrowseAndRequestConfiguration.mockReturnValue({
      data: {
        subsidyRequestsEnabled: false,
        subsidyType: SUBSIDY_TYPE.LICENSE,
      },
    });

    const { result } = renderHook(() => useHasValidLicenseOrSubscriptionRequestsEnabled());
    expect(result.current).toBe(false);
  });
});
