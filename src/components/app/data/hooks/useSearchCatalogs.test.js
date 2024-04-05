import { renderHook } from '@testing-library/react-hooks';
import '@testing-library/jest-dom/extend-expect';
import { AppContext } from '@edx/frontend-platform/react';
import useSearchCatalogs from './useSearchCatalogs';
import { LICENSE_STATUS } from '../../../enterprise-user-subsidy/data/constants';
import { features } from '../../../../config';
import {
  useEnterpriseCustomer,
} from '..';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../services/data/__factories__';
import useCatalogsForSubsidyRequests from './useCatalogsForSubsidyRequests';
import useSubscriptions from './useSubscriptions';
import useRedeemablePolicies from './useRedeemablePolicies';
import useCouponCodes from './useCouponCodes';
import useEnterpriseOffers from './useEnterpriseOffers';

jest.mock('../../../app/data', () => ({
  ...jest.requireActual('../../../app/data'),
  useEnterpriseCustomer: jest.fn(),
}));

jest.mock('./useSubscriptions');
jest.mock('./useCatalogsForSubsidyRequests');
jest.mock('./useRedeemablePolicies');
jest.mock('./useCouponCodes');
jest.mock('./useEnterpriseOffers');

jest.mock('@edx/frontend-enterprise-catalog-search', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-catalog-search'),
  setRefinementAction: jest.fn(() => ({ key: 'SET_REFINEMENT' })),
}));
const mockEnterpriseCustomer = enterpriseCustomerFactory();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    enterpriseSlug: mockEnterpriseCustomer.slug,
  }),
  useLocation: () => ({
    search: '?q=test%20query&subjects=Computer%20Science,Communication&availability=Upcoming&ignore=true',
  }),
  useHistory: () => ({ push: jest.fn }),
}));
jest.mock('../../../../config', () => ({
  features: { ENROLL_WITH_CODES: true },
}));

const mockSubscriptionCatalog = 'test-subscription-catalog-uuid';
const mockCouponCodeCatalog = 'test-coupon-code-catalog-uuid';
const mockEnterpriseOfferCatalog = 'test-enterprise-offer-catalog-uuid';
const mockPolicyCatalog = 'test-policy-catalog-uuid';
const defaultAppContextValue = {
  authenticatedUser: authenticatedUserFactory(),
};

describe('useSearchCatalogs', () => {
  const Wrapper = ({ children }) => (
    // eslint-disable-next-line react/jsx-filename-extension
    <AppContext.Provider value={defaultAppContextValue}>
      {children}
    </AppContext.Provider>
  );
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useRedeemablePolicies.mockReturnValue({ data: { redeemablePolicies: [] } });
    useCatalogsForSubsidyRequests.mockReturnValue([]);
    useEnterpriseOffers.mockReturnValue({ data: { currentEnterpriseOffers: [] } });
    useSubscriptions.mockReturnValue({ data: { subscriptionLicense: [] } });
    useCouponCodes.mockReturnValue({ data: { couponCodeAssignments: [] } });
  });

  it.each([
    {
      isSubscriptionPlanExpired: true,
    },
    {
      isSubscriptionPlanExpired: false,
    },
  ])('should include catalog from subscription (%s)', ({ isSubscriptionPlanExpired }) => {
    const mockSubscriptionLicense = {
      status: isSubscriptionPlanExpired ? LICENSE_STATUS.ASSIGNED : LICENSE_STATUS.ACTIVATED,
      subscriptionPlan: {
        enterpriseCatalogUuid: mockSubscriptionCatalog,
        isActive: isSubscriptionPlanExpired,
      },
    };
    useSubscriptions.mockReturnValue({
      data: { subscriptionLicense: mockSubscriptionLicense },
    });
    const { result } = renderHook(() => useSearchCatalogs(), { wrapper: Wrapper });
    if (isSubscriptionPlanExpired) {
      expect(result.current).toEqual([]);
    } else {
      expect(result.current).toEqual([mockSubscriptionCatalog]);
    }
  });

  it.each([
    { isCouponExpired: true },
    { isCouponExpired: false },
  ])('should include catalogs from coupon codes if features.ENROLL_WITH_CODES = true (%s)', ({
    isCouponExpired,
  }) => {
    features.ENROLL_WITH_CODES = true;
    const mockCouponCodeAssignments = [
      {
        catalog: mockCouponCodeCatalog,
        available: !isCouponExpired,
      },
    ];
    useCouponCodes.mockReturnValue({ data: { couponCodeAssignments: mockCouponCodeAssignments } });
    const { result } = renderHook(() => useSearchCatalogs(), { wrapper: Wrapper });
    if (isCouponExpired) {
      expect(result.current).toEqual([]);
    } else {
      expect(result.current).toEqual([mockCouponCodeCatalog]);
    }
  });

  it('should not include catalogs from coupon codes if features.ENROLL_WITH_CODES = false', () => {
    features.ENROLL_WITH_CODES = false;
    const mockCouponCodeAssignments = [{ catalog: mockCouponCodeCatalog }];
    useCouponCodes.mockReturnValue({ data: { couponCodeAssignments: mockCouponCodeAssignments } });
    const { result } = renderHook(() => useSearchCatalogs(), { wrapper: Wrapper });
    expect(result.current).toEqual([]);
  });

  it('should include catalogs from enterprise offers if features.FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS = true', () => {
    features.FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS = true;
    const mockCurrentEnterpriseOffers = [{ enterpriseCatalogUuid: mockEnterpriseOfferCatalog }];
    useEnterpriseOffers.mockReturnValue({ data: { currentEnterpriseOffers: mockCurrentEnterpriseOffers } });
    const { result } = renderHook(() => useSearchCatalogs(), { wrapper: Wrapper });
    expect(result.current).toEqual([mockEnterpriseOfferCatalog]);
  });

  it('should not include catalogs from enterprise offers if features.FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS = false', () => {
    features.FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS = false;
    const mockCurrentEnterpriseOffers = [{ enterpriseCatalogUuid: mockEnterpriseOfferCatalog }];
    useEnterpriseOffers.mockReturnValue({ data: { currentEnterpriseOffers: mockCurrentEnterpriseOffers } });
    const { result } = renderHook(() => useSearchCatalogs(), { wrapper: Wrapper });
    expect(result.current).toEqual([]);
  });

  it('should include catalogs for browse and request', () => {
    const mockCatalogsForSubsidyRequest = ['test-catalog-uuid-1', 'test-catalog-uuid-2'];
    useCatalogsForSubsidyRequests.mockReturnValue(mockCatalogsForSubsidyRequest);
    const { result } = renderHook(() => useSearchCatalogs(), { wrapper: Wrapper });
    expect(result.current).toEqual(mockCatalogsForSubsidyRequest);
  });

  it.each([
    {
      hasDefinedPolicies: false,
      isPolicyExpired: false,
    },
    {
      hasDefinedPolicies: true,
      isPolicyExpired: false,
    },
    {
      hasDefinedPolicies: true,
      isPolicyExpired: true,
    },
  ])('should include catalogs for redeemable subsidy access policies (%s)', ({
    hasDefinedPolicies,
    isPolicyExpired,
  }) => {
    const mockRedeemablePolicies = hasDefinedPolicies ? [{
      active: !isPolicyExpired,
      catalogUuid: mockPolicyCatalog,
    }] : [];
    useRedeemablePolicies.mockReturnValue({ data: { redeemablePolicies: mockRedeemablePolicies } });
    const { result } = renderHook(() => useSearchCatalogs(), { wrapper: Wrapper });

    if (!hasDefinedPolicies) {
      expect(result.current).toEqual([]);
    } else {
      expect(result.current).toEqual([mockPolicyCatalog]);
    }
  });
});
