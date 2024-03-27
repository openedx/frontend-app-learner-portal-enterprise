import { renderHook } from '@testing-library/react-hooks';
import '@testing-library/jest-dom/extend-expect';
import useSearchCatalogs from './useSearchCatalogs';
import { LICENSE_STATUS } from '../../../enterprise-user-subsidy/data/constants';
import { features } from '../../../../config';
import {
  useCouponCodes,
  useEnterpriseCustomer,
  useEnterpriseOffers,
  useRedeemablePolicies,
  useSubscriptions,
} from '../../../app/data';
import { enterpriseCustomerFactory } from '../../../app/data/services/data/__factories__';
import { useCatalogsForSubsidyRequests } from '../../../hooks';

jest.mock('../../../app/data', () => ({
  ...jest.requireActual('../../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useSubscriptions: jest.fn(),
  useRedeemablePolicies: jest.fn(),
  useCouponCodes: jest.fn(),
  useEnterpriseOffers: jest.fn(),
}));

jest.mock('../../../hooks', () => ({
  ...jest.requireActual('../../../hooks'),
  useCatalogsForSubsidyRequests: jest.fn(),
}));

jest.mock('@edx/frontend-enterprise-catalog-search', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-catalog-search'),
  setRefinementAction: jest.fn(() => ({ key: 'SET_REFINEMENT' })),
}));
jest.mock('react-router-dom', () => ({
  useLocation: () => ({
    search: '?q=test%20query&subjects=Computer%20Science,Communication&availability=Upcoming&ignore=true',
  }),
  useHistory: () => ({ push: jest.fn }),
}));
jest.mock('../../../../config', () => ({
  features: { ENROLL_WITH_CODES: true },
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockSubscriptionCatalog = 'test-subscription-catalog-uuid';
const mockCouponCodeCatalog = 'test-coupon-code-catalog-uuid';
const mockEnterpriseOfferCatalog = 'test-enterprise-offer-catalog-uuid';
const mockPolicyCatalog = 'test-policy-catalog-uuid';

describe('useSearchCatalogs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useRedeemablePolicies.mockReturnValue({ data: { redeemablePolicies: [] } });
    useCatalogsForSubsidyRequests.mockReturnValue({ catalogsForSubsidyRequests: [] });
    useEnterpriseOffers.mockReturnValue({ data: { currentEnterpriseOffers: [] } });
    useSubscriptions.mockReturnValue({ data: { subscriptionLicense: [] } });
    useCouponCodes.mockReturnValue({ data: { couponCodeAssignments: [] } });
  });

  it.each('should include catalog from subscription (%s)', ({ isSubscriptionPlanExpired }) => {
    const mockSubscriptionLicense = {
      status: LICENSE_STATUS.ACTIVATED,
      subscriptionPlan: {
        enterpriseCatalogUuid: mockSubscriptionCatalog,
      },
    };
    useSubscriptions.mockReturnValue({
      data: { subscriptionLicense: mockSubscriptionLicense },
    });
    const { result } = renderHook((() => useSearchCatalogs()));
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
    const { result } = renderHook(() => useSearchCatalogs());
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
    const { result } = renderHook(() => useSearchCatalogs());
    expect(result.current).toEqual([]);
  });

  it('should include catalogs from enterprise offers if features.FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS = true', () => {
    features.FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS = true;
    const mockCurrentEnterpriseOffers = [{ enterpriseCatalogUuid: mockEnterpriseOfferCatalog }];
    useEnterpriseOffers.mockReturnValue({ data: { currentEnterpriseOffers: mockCurrentEnterpriseOffers } });
    const { result } = renderHook(() => useSearchCatalogs());
    expect(result.current).toEqual([mockEnterpriseOfferCatalog]);
  });

  it('should not include catalogs from enterprise offers if features.FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS = false', () => {
    features.FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS = false;
    const mockCurrentEnterpriseOffers = [{ enterpriseCatalogUuid: mockEnterpriseOfferCatalog }];
    useEnterpriseOffers.mockReturnValue({ data: { currentEnterpriseOffers: mockCurrentEnterpriseOffers } });
    const { result } = renderHook(() => useSearchCatalogs());
    expect(result.current).toEqual([]);
  });

  it('should include catalogs for browse and request', () => {
    const mockCatalogsForSubsidyRequest = ['test-catalog-uuid-1', 'test-catalog-uuid-2'];
    useCatalogsForSubsidyRequests.mockReturnValue({ catalogsForSubsidyRequests: mockCatalogsForSubsidyRequest });
    const { result } = renderHook(() => useSearchCatalogs());
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
    const { result } = renderHook(() => useSearchCatalogs());

    if (!hasDefinedPolicies) {
      expect(result.current).toEqual([]);
    } else {
      expect(result.current).toEqual([mockPolicyCatalog]);
    }
  });
});
