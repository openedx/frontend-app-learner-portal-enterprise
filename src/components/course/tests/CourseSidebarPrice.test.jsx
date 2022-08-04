import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { AppContext } from '@edx/frontend-platform/react';
import { CourseContextProvider } from '../CourseContextProvider';
import { SubsidyRequestsContext, SUBSIDY_TYPE } from '../../enterprise-subsidy-requests';
import CourseSidebarPrice, { INCLUDED_IN_SUBSCRIPTION_MESSAGE, FREE_WHEN_APPROVED_MESSAGE, COVERED_BY_ENTERPRISE_OFFER_MESSAGE } from '../CourseSidebarPrice';
import {
  LICENSE_SUBSIDY_TYPE,
  COUPON_CODE_SUBSIDY_TYPE,
  SUBSIDY_DISCOUNT_TYPE_MAP,
  ENTERPRISE_OFFER_SUBSIDY_TYPE,
} from '../data/constants';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { ENTERPRISE_OFFER_TYPE } from '../../enterprise-user-subsidy/enterprise-offers/data/constants';

const appStateWithOrigPriceHidden = {
  enterpriseConfig: {
    name: 'test-enterprise',
    slug: 'test-enterprise-slug',
    hideCourseOriginalPrice: true,
    adminUsers: [],
  },
};

const appStateWithOrigPriceShowing = {
  ...appStateWithOrigPriceHidden,
  enterpriseConfig: {
    ...appStateWithOrigPriceHidden.enterpriseConfig,
    hideCourseOriginalPrice: false,
  },
};

const BASE_COURSE_STATE = {
  activeCourseRun: {
    firstEnrollablePaidSeatPrice: 7.50,
  },
  userSubsidyApplicableToCourse: null,
  course: {},
  userEnrollments: [],
  userEntitlements: [],
  catalog: {
    containsContentItems: true,
    catalogList: ['test-catalog-uuid'],
  },
  courseRecommendations: {},
};

const courseStateWithLicenseSubsidy = {
  ...BASE_COURSE_STATE,
  userSubsidyApplicableToCourse: { subsidyType: LICENSE_SUBSIDY_TYPE },
};

// making discountType uppercase to help validate case-safe check in hooks logic
const FULL_COUPON_CODE_SUBSIDY = {
  discountType: SUBSIDY_DISCOUNT_TYPE_MAP.PERCENTAGE.toUpperCase(),
  discountValue: 100,
  subsidyType: COUPON_CODE_SUBSIDY_TYPE,
};

const PARTIAL_COUPON_CODE_SUBSIDY = {
  ...FULL_COUPON_CODE_SUBSIDY,
  discountValue: 90,
};

const courseStateFullCouponCodeSubsidy = {
  ...BASE_COURSE_STATE,
  catalog: { catalogList: ['bears'] },
  userSubsidyApplicableToCourse: FULL_COUPON_CODE_SUBSIDY,
};

const courseStatePartialCouponCodeSubsidy = {
  ...BASE_COURSE_STATE,
  catalog: { catalogList: ['bears'] },
  userSubsidyApplicableToCourse: PARTIAL_COUPON_CODE_SUBSIDY,
};

const courseStateWithNoCodesNoLicenseSubsidy = {
  ...BASE_COURSE_STATE,
  catalog: { catalogList: ['bears'] },
};

const defaultSubsidyRequestsState = {
  subsidyRequestConfiguration: null,
  requestsBySubsidyType: {
    [SUBSIDY_TYPE.LICENSE]: [],
    [SUBSIDY_TYPE.COUPON]: [],
  },
  catalogsForSubsidyRequests: [],
};

const defaultUserSubsidyState = {
  enterpriseOffers: [],
  canEnrollWithEnterpriseOffers: false,
};

/* eslint-disable react/prop-types */
function SidebarWithContext({
  initialAppState = appStateWithOrigPriceHidden,
  subsidyRequestsState = defaultSubsidyRequestsState,
  initialCourseState,
  initialUserSubsidyState = defaultUserSubsidyState,
}) {
  return (
    <AppContext.Provider value={initialAppState}>
      <UserSubsidyContext.Provider value={initialUserSubsidyState}>
        <SubsidyRequestsContext.Provider value={subsidyRequestsState}>
          <CourseContextProvider initialState={initialCourseState}>
            <CourseSidebarPrice />
          </CourseContextProvider>
        </SubsidyRequestsContext.Provider>
      </UserSubsidyContext.Provider>
    </AppContext.Provider>
  );
}
/* eslint-enable react/prop-types */

const SPONSORED_BY_TEXT = 'Sponsored by test-enterprise';

describe('<CourseSidebarPrice/> ', () => {
  describe('Browse and Request', () => {
    test('Display correct message when browse and request on and no subsidy', () => {
      render(
        <SidebarWithContext
          initialCourseState={courseStateWithNoCodesNoLicenseSubsidy}
          subsidyRequestsState={{
            ...defaultSubsidyRequestsState,
            subsidyRequestConfiguration: { subsidyRequestsEnabled: true },
          }}
        />,
      );
      expect(screen.getByText(/\$7.50 USD/));
      expect(screen.getByText(FREE_WHEN_APPROVED_MESSAGE.replace('\n', ' ')));
      expect(screen.getByTestId('browse-and-request-pricing')).toBeInTheDocument();
      expect(screen.queryByText(INCLUDED_IN_SUBSCRIPTION_MESSAGE)).not.toBeInTheDocument();
      expect(screen.queryByText(SPONSORED_BY_TEXT)).not.toBeInTheDocument();
    });
  });

  describe('Enterprise offers', () => {
    test('Display correct message when enterprise offer exists', () => {
      const mockEnterpriseOffer = {
        discountValue: 100,
        discountType: SUBSIDY_DISCOUNT_TYPE_MAP.PERCENTAGE.toUpperCase(),
        enterpriseCatalogUuid: 'bears',
        remainingBalance: 100,
      };
      const mockEnterpriseOfferSubsidy = {
        ...mockEnterpriseOffer,
        subsidyType: ENTERPRISE_OFFER_SUBSIDY_TYPE,
      };
      render(
        <SidebarWithContext
          initialAppState={appStateWithOrigPriceShowing}
          initialCourseState={{
            ...BASE_COURSE_STATE,
            userSubsidyApplicableToCourse: mockEnterpriseOfferSubsidy,
          }}
          initialUserSubsidyState={{
            ...defaultUserSubsidyState,
            enterpriseOffers: [mockEnterpriseOfferSubsidy],
            canEnrollWithEnterpriseOffers: true,
          }}
        />,
      );
      expect(screen.getByText('Priced reduced from:')).toBeInTheDocument();
      expect(screen.getByText(/\$7.50 USD/)).toBeInTheDocument();
      expect(screen.getByText(COVERED_BY_ENTERPRISE_OFFER_MESSAGE)).toBeInTheDocument();
    });

    test.each([
      ENTERPRISE_OFFER_TYPE.BOOKINGS_AND_ENROLLMENTS_LIMIT,
      ENTERPRISE_OFFER_TYPE.BOOKINGS_LIMIT,
    ])('Display insufficient enterprise offer balance message', (offerType) => {
      const mockEnterpriseOffer = {
        discountValue: 100,
        discountType: SUBSIDY_DISCOUNT_TYPE_MAP.PERCENTAGE.toUpperCase(),
        enterpriseCatalogUuid: 'test-catalog-uuid',
        remainingBalance: 1,
        offerType,
      };
      const mockEnterpriseOfferSubsidy = {
        ...mockEnterpriseOffer,
        subsidyType: ENTERPRISE_OFFER_SUBSIDY_TYPE,
      };
      render(
        <SidebarWithContext
          initialAppState={appStateWithOrigPriceShowing}
          initialCourseState={{
            ...BASE_COURSE_STATE,
            userSubsidyApplicableToCourse: undefined,
          }}
          initialUserSubsidyState={{
            ...defaultUserSubsidyState,
            enterpriseOffers: [mockEnterpriseOfferSubsidy],
            canEnrollWithEnterpriseOffers: true,
          }}
        />,
      );
      expect(screen.getByTestId('insufficient-offer-balance-text')).toBeInTheDocument();
    });

    describe('Does not display insufficient enterprise offer balance message', () => {
      test('When offer has no bookings limit', () => {
        const mockEnterpriseOffer = {
          discountValue: 100,
          discountType: SUBSIDY_DISCOUNT_TYPE_MAP.PERCENTAGE.toUpperCase(),
          enterpriseCatalogUuid: 'test-catalog-uuid',
          maxDiscount: null,
          maxUserDiscount: null,
          remainingBalance: null,
          offerType: ENTERPRISE_OFFER_TYPE.NO_LIMIT,
        };
        const mockEnterpriseOfferSubsidy = {
          ...mockEnterpriseOffer,
          subsidyType: ENTERPRISE_OFFER_SUBSIDY_TYPE,
        };
        render(
          <SidebarWithContext
            initialAppState={appStateWithOrigPriceShowing}
            initialCourseState={{
              ...BASE_COURSE_STATE,
              userSubsidyApplicableToCourse: undefined,
            }}
            initialUserSubsidyState={{
              ...defaultUserSubsidyState,
              enterpriseOffers: [mockEnterpriseOfferSubsidy],
              canEnrollWithEnterpriseOffers: true,
            }}
          />,
        );
        expect(screen.queryByTestId('insufficient-offer-balance-text')).not.toBeInTheDocument();
      });

      test('When canEnrollWithEnterpriseOffers = false', () => {
        const mockEnterpriseOffer = {
          discountValue: 100,
          discountType: SUBSIDY_DISCOUNT_TYPE_MAP.PERCENTAGE.toUpperCase(),
          enterpriseCatalogUuid: 'test-catalog-uuid',
          maxDiscount: 1000,
          maxUserDiscount: null,
          remainingBalance: 0,
          offerType: ENTERPRISE_OFFER_TYPE.BOOKINGS_LIMIT,
        };
        render(
          <SidebarWithContext
            initialAppState={appStateWithOrigPriceShowing}
            initialCourseState={{
              ...BASE_COURSE_STATE,
              userSubsidyApplicableToCourse: undefined,
            }}
            initialUserSubsidyState={{
              ...defaultUserSubsidyState,
              enterpriseOffers: [mockEnterpriseOffer],
              canEnrollWithEnterpriseOffers: false,
            }}
          />,
        );
        expect(screen.queryByTestId('insufficient-offer-balance-text')).not.toBeInTheDocument();
        expect(screen.getByText(/\$7.50 USD/)).toBeInTheDocument();
      });

      test('When there are no enterprise offers with the correct catalog with remaining balance < course price', () => {
        const mockEnterpriseOffer = {
          discountValue: 100,
          discountType: SUBSIDY_DISCOUNT_TYPE_MAP.PERCENTAGE.toUpperCase(),
          enterpriseCatalogUuid: 'wrong-catalog-uuid',
          remainingBalance: 0,
          maxDiscount: 1000,
          maxUserDiscount: null,
          offerType: ENTERPRISE_OFFER_TYPE.BOOKINGS_LIMIT,
        };

        render(
          <SidebarWithContext
            initialAppState={appStateWithOrigPriceShowing}
            initialCourseState={{
              ...BASE_COURSE_STATE,
              userSubsidyApplicableToCourse: undefined,
            }}
            initialUserSubsidyState={{
              ...defaultUserSubsidyState,
              enterpriseOffers: [mockEnterpriseOffer],
              canEnrollWithEnterpriseOffers: true,
            }}
          />,
        );
        expect(screen.queryByTestId('insufficient-offer-balance-text')).not.toBeInTheDocument();
        expect(screen.getByText(/\$7.50 USD/)).toBeInTheDocument();
      });
    });
  });

  describe('Sidebar price display with hideCourseOriginalPrice ON, No subsidies', () => {
    test('no subsidies, shows original price, no messages', () => {
      render(<SidebarWithContext initialCourseState={courseStateWithNoCodesNoLicenseSubsidy} />);
      expect(screen.getByText(/\$7.50 USD/)).toBeInTheDocument();
      expect(screen.queryByText(INCLUDED_IN_SUBSCRIPTION_MESSAGE)).not.toBeInTheDocument();
      expect(screen.queryByText(SPONSORED_BY_TEXT)).not.toBeInTheDocument();
    });
  });

  describe('Sidebar price display with hideCourseOriginalPrice ON', () => {
    test('subscription license subsidy, shows no price, correct message', () => {
      render(<SidebarWithContext initialCourseState={courseStateWithLicenseSubsidy} />);
      expect(screen.queryByText(/\$7.50 USD/)).not.toBeInTheDocument();
      expect(screen.getByText(INCLUDED_IN_SUBSCRIPTION_MESSAGE));
      expect(screen.queryByText(SPONSORED_BY_TEXT)).not.toBeInTheDocument();
    });
    test('coupon code 100% subsidy, shows no price, correct message', () => {
      render(<SidebarWithContext
        initialCourseState={courseStateFullCouponCodeSubsidy}
      />);
      expect(screen.queryByText(/\$7.50 USD/)).not.toBeInTheDocument();
      expect(screen.queryByText(/\$0.00 USD/)).not.toBeInTheDocument();
      expect(screen.queryByText(INCLUDED_IN_SUBSCRIPTION_MESSAGE)).not.toBeInTheDocument();
      expect(screen.getByText(SPONSORED_BY_TEXT));
    });
    test('coupon code non-full subsidy, shows discounted price only, correct message', () => {
      render(<SidebarWithContext
        initialCourseState={courseStatePartialCouponCodeSubsidy}
      />);
      expect(screen.getByText(/\$0.75 USD/));
      expect(screen.queryByText(INCLUDED_IN_SUBSCRIPTION_MESSAGE)).not.toBeInTheDocument();
      expect(screen.getByText(SPONSORED_BY_TEXT));
    });
  });

  // We only test price here, since messages are already tested above
  describe('Sidebar price display with hideCourseOriginalPrice OFF', () => {
    test('no subsidies, shows original price, no messages', () => {
      render(<SidebarWithContext
        initialAppState={appStateWithOrigPriceShowing}
        initialCourseState={courseStateWithNoCodesNoLicenseSubsidy}
      />);
      expect(screen.getByText(/\$7.50 USD/));
    });
    test('subscription license subsidy, shows orig crossed out price, correct message', () => {
      render(<SidebarWithContext
        initialAppState={appStateWithOrigPriceShowing}
        initialCourseState={courseStateWithLicenseSubsidy}
      />);
      expect(screen.getByText(/\$7.50 USD/));
    });
    test('coupon code 100% subsidy, shows orig price, correct message', () => {
      render(<SidebarWithContext
        initialAppState={appStateWithOrigPriceShowing}
        initialCourseState={courseStateFullCouponCodeSubsidy}
      />);
      expect(screen.getByText(/\$7.50 USD/));
    });
    test('coupon code non-full subsidy, shows orig and discounted price only, correct message', () => {
      render(<SidebarWithContext
        initialAppState={appStateWithOrigPriceShowing}
        initialCourseState={courseStatePartialCouponCodeSubsidy}
      />);
      expect(screen.getByText(/\$7.50 USD/));
      expect(screen.getByText(/\$0.75 USD/));
    });
  });
});
