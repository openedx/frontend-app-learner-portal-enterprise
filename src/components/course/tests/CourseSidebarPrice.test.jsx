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
import { emptyRedeemableLearnerCreditPolicies } from '../../enterprise-user-subsidy/data/constants';

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
const mockCatalogUUID = 'test-catalog-uuid';
const BASE_COURSE_STATE = {
  activeCourseRun: {
    firstEnrollablePaidSeatPrice: 7.50,
  },
  course: {},
  userEnrollments: [],
  userEntitlements: [],
  catalog: {
    containsContentItems: true,
    catalogList: [mockCatalogUUID],
  },
  courseRecommendations: {},
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

const baseCourseContextProps = {
  courseState: BASE_COURSE_STATE,
  userSubsidyApplicableToCourse: null,
  subsidyRequestCatalogsApplicableToCourse: new Set([mockCatalogUUID]),
  coursePrice: { list: 7.5, discounted: 7.5 },
  currency: 'USD',
};

const courseContextPropsWithLicenseSubsidy = {
  ...baseCourseContextProps,
  coursePrice: { list: 7.5, discounted: 0 },
  userSubsidyApplicableToCourse: { subsidyType: LICENSE_SUBSIDY_TYPE },
};

const courseContextPropsFullCouponCodeSubsidy = {
  ...baseCourseContextProps,
  coursePrice: { list: 7.5, discounted: 0 },
  userSubsidyApplicableToCourse: FULL_COUPON_CODE_SUBSIDY,
};

const courseContextPropsPartialCouponCodeSubsidy = {
  ...baseCourseContextProps,
  coursePrice: { list: 7.5, discounted: 3.75 },
  userSubsidyApplicableToCourse: PARTIAL_COUPON_CODE_SUBSIDY,
};

const defaultSubsidyRequestsState = {
  subsidyRequestConfiguration: null,
  requestsBySubsidyType: {
    [SUBSIDY_TYPE.LICENSE]: [],
    [SUBSIDY_TYPE.COUPON]: [],
  },
  catalogsForSubsidyRequests: [],
};

const SidebarWithContext = ({
  initialAppState = appStateWithOrigPriceHidden,
  subsidyRequestsState = defaultSubsidyRequestsState,
  courseContextProps = {},
  initialUserSubsidyState = {
    subscriptionLicense: null,
    couponCodes: {
      couponCodes: [{ discountValue: 90 }],
      couponCodesCount: 0,
    },
    redeemableLearnerCreditPolicies: emptyRedeemableLearnerCreditPolicies,
  },
}) => (
  <AppContext.Provider value={initialAppState}>
    <SubsidyRequestsContext.Provider value={subsidyRequestsState}>
      <UserSubsidyContext.Provider value={initialUserSubsidyState}>
        <CourseContextProvider {...courseContextProps}>
          <CourseSidebarPrice />
        </CourseContextProvider>
      </UserSubsidyContext.Provider>
    </SubsidyRequestsContext.Provider>
  </AppContext.Provider>
);

const SPONSORED_BY_TEXT = 'Sponsored by test-enterprise';

describe('<CourseSidebarPrice/> ', () => {
  describe('Browse and Request', () => {
    test('Display correct message when browse and request on and user has no subsidy', () => {
      render(
        <SidebarWithContext
          courseContextProps={baseCourseContextProps}
          subsidyRequestsState={{
            ...defaultSubsidyRequestsState,
            subsidyRequestConfiguration: { subsidyRequestsEnabled: true },
          }}
        />,
      );
      expect(screen.getByText(/\$7.50 USD/)).toBeInTheDocument();
      expect(screen.getByText(FREE_WHEN_APPROVED_MESSAGE.replace('\n', ' '))).toBeInTheDocument();
      expect(screen.getByTestId('browse-and-request-pricing')).toBeInTheDocument();
      expect(screen.queryByText(INCLUDED_IN_SUBSCRIPTION_MESSAGE)).not.toBeInTheDocument();
      expect(screen.queryByText(SPONSORED_BY_TEXT)).not.toBeInTheDocument();
    });

    test('Display correct message when browse and request on, course is included in subsidy request catalog(s), and user has no subsidy', () => {
      render(
        <SidebarWithContext
          courseContextProps={{
            ...baseCourseContextProps,
            subsidyRequestCatalogsApplicableToCourse: new Set([]),
          }}
          subsidyRequestsState={{
            ...defaultSubsidyRequestsState,
            subsidyRequestConfiguration: { subsidyRequestsEnabled: true },
          }}
        />,
      );
      expect(screen.getByText(/\$7.50 USD/)).toBeInTheDocument();
      expect(screen.queryByText(FREE_WHEN_APPROVED_MESSAGE.replace('\n', ' '))).not.toBeInTheDocument();
      expect(screen.queryByTestId('browse-and-request-pricing')).not.toBeInTheDocument();
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
          courseContextProps={{
            courseState: BASE_COURSE_STATE,
            userSubsidyApplicableToCourse: mockEnterpriseOfferSubsidy,
            coursePrice: { list: 7.5, discounted: 0 },
            currency: 'USD',
          }}
        />,
      );
      expect(screen.getByText('Priced reduced from:')).toBeInTheDocument();
      expect(screen.getByText(/\$7.50 USD/)).toBeInTheDocument();
      expect(screen.queryByText(COVERED_BY_ENTERPRISE_OFFER_MESSAGE)).toBeInTheDocument();
      expect(screen.queryByText(INCLUDED_IN_SUBSCRIPTION_MESSAGE)).not.toBeInTheDocument();
      expect(screen.queryByText(SPONSORED_BY_TEXT)).not.toBeInTheDocument();
    });
  });

  describe('Sidebar price display with hideCourseOriginalPrice ON, No subsidies', () => {
    test('no subsidies, shows original price, no messages', () => {
      render(
        <SidebarWithContext courseContextProps={baseCourseContextProps} />,
      );
      expect(screen.getByText(/\$7.50 USD/)).toBeInTheDocument();
      expect(screen.queryByText(INCLUDED_IN_SUBSCRIPTION_MESSAGE)).not.toBeInTheDocument();
      expect(screen.queryByText(SPONSORED_BY_TEXT)).not.toBeInTheDocument();
      expect(screen.queryByText(COVERED_BY_ENTERPRISE_OFFER_MESSAGE)).not.toBeInTheDocument();
    });
  });

  describe('Sidebar price display with hideCourseOriginalPrice ON', () => {
    test('subscription license subsidy, shows no price, correct message', () => {
      render(
        <SidebarWithContext
          courseContextProps={courseContextPropsWithLicenseSubsidy}
        />,
      );
      expect(screen.queryByText(/\$7.50 USD/)).not.toBeInTheDocument();
      expect(screen.queryByText(INCLUDED_IN_SUBSCRIPTION_MESSAGE)).toBeInTheDocument();
      expect(screen.queryByText(SPONSORED_BY_TEXT)).not.toBeInTheDocument();
      expect(screen.queryByText(COVERED_BY_ENTERPRISE_OFFER_MESSAGE)).not.toBeInTheDocument();
    });
    test('coupon code 100% subsidy, shows no price, correct message', () => {
      render(<SidebarWithContext courseContextProps={courseContextPropsFullCouponCodeSubsidy} />);
      expect(screen.queryByText(/\$7.50 USD/)).not.toBeInTheDocument();
      expect(screen.queryByText(/\$0.00 USD/)).not.toBeInTheDocument();
      expect(screen.queryByText(INCLUDED_IN_SUBSCRIPTION_MESSAGE)).not.toBeInTheDocument();
      expect(screen.queryByText(SPONSORED_BY_TEXT)).toBeInTheDocument();
      expect(screen.queryByText(COVERED_BY_ENTERPRISE_OFFER_MESSAGE)).not.toBeInTheDocument();
    });
    test('coupon code non-full subsidy, shows discounted price only, correct message', () => {
      render(<SidebarWithContext courseContextProps={courseContextPropsPartialCouponCodeSubsidy} />);
      expect(screen.getByText(/\$3.75 USD/)).toBeInTheDocument();
      expect(screen.queryByText(INCLUDED_IN_SUBSCRIPTION_MESSAGE)).not.toBeInTheDocument();
      expect(screen.queryByText(SPONSORED_BY_TEXT)).toBeInTheDocument();
      expect(screen.queryByText(COVERED_BY_ENTERPRISE_OFFER_MESSAGE)).not.toBeInTheDocument();
    });
  });

  // We only test price here, since messages are already tested above
  describe('Sidebar price display with hideCourseOriginalPrice OFF', () => {
    test('no subsidies, shows original price, no messages', () => {
      render(<SidebarWithContext
        initialAppState={appStateWithOrigPriceShowing}
        courseContextProps={baseCourseContextProps}
      />);
      expect(screen.getByText(/\$7.50 USD/)).toBeInTheDocument();
      expect(screen.queryByText(INCLUDED_IN_SUBSCRIPTION_MESSAGE)).not.toBeInTheDocument();
      expect(screen.queryByText(SPONSORED_BY_TEXT)).not.toBeInTheDocument();
      expect(screen.queryByText(COVERED_BY_ENTERPRISE_OFFER_MESSAGE)).not.toBeInTheDocument();
    });
    test('subscription license subsidy, shows orig crossed out price, correct message', () => {
      render(<SidebarWithContext
        initialAppState={appStateWithOrigPriceShowing}
        courseContextProps={courseContextPropsWithLicenseSubsidy}
      />);
      expect(screen.getByText(/\$7.50 USD/)).toBeInTheDocument();
      expect(screen.queryByText(INCLUDED_IN_SUBSCRIPTION_MESSAGE)).toBeInTheDocument();
      expect(screen.queryByText(SPONSORED_BY_TEXT)).not.toBeInTheDocument();
      expect(screen.queryByText(COVERED_BY_ENTERPRISE_OFFER_MESSAGE)).not.toBeInTheDocument();
    });
    test('coupon code 100% subsidy, shows orig price, correct message', () => {
      render(<SidebarWithContext
        initialAppState={appStateWithOrigPriceShowing}
        courseContextProps={courseContextPropsFullCouponCodeSubsidy}
      />);
      expect(screen.getByText(/\$7.50 USD/)).toBeInTheDocument();
      expect(screen.queryByText(INCLUDED_IN_SUBSCRIPTION_MESSAGE)).not.toBeInTheDocument();
      expect(screen.getByText(SPONSORED_BY_TEXT)).toBeInTheDocument();
      expect(screen.queryByText(COVERED_BY_ENTERPRISE_OFFER_MESSAGE)).not.toBeInTheDocument();
    });
    test('coupon code non-full subsidy, shows orig and discounted price only, correct message', () => {
      render(<SidebarWithContext
        initialAppState={appStateWithOrigPriceShowing}
        courseContextProps={courseContextPropsPartialCouponCodeSubsidy}
      />);
      expect(screen.getByText(/\$7.50 USD/)).toBeInTheDocument();
      expect(screen.getByText(/\$3.75 USD/)).toBeInTheDocument();
      expect(screen.queryByText(INCLUDED_IN_SUBSCRIPTION_MESSAGE)).not.toBeInTheDocument();
      expect(screen.getByText(SPONSORED_BY_TEXT)).toBeInTheDocument();
      expect(screen.queryByText(COVERED_BY_ENTERPRISE_OFFER_MESSAGE)).not.toBeInTheDocument();
    });
  });

  test('renders skeleton loading state if no course price is specified', () => {
    render(<SidebarWithContext
      courseContextProps={{
        ...baseCourseContextProps,
        coursePrice: undefined,
      }}
    />);
    expect(screen.getByTestId('course-price-skeleton')).toBeInTheDocument();
  });
});
