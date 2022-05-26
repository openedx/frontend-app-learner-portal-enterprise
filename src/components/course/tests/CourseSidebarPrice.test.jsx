import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import PropTypes from 'prop-types';

import { AppContext } from '@edx/frontend-platform/react';
import { CourseContextProvider } from '../CourseContextProvider';
import { SubsidyRequestsContext, SUBSIDY_TYPE } from '../../enterprise-subsidy-requests';
import CourseSidebarPrice, { INCLUDED_IN_SUBSCRIPTION_MESSAGE, FREE_WHEN_APPROVED_MESSAGE } from '../CourseSidebarPrice';
import {
  LICENSE_SUBSIDY_TYPE,
  COUPON_CODE_SUBSIDY_TYPE,
  SUBSIDY_DISCOUNT_TYPE_MAP,
} from '../data/constants';

const appStateWithOrigPriceHidden = {
  enterpriseConfig: {
    name: 'test-enterprise',
    slug: 'test-enterprise-slug',
    hideCourseOriginalPrice: true,
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
  catalogsForSubsidyRequests: new Set(),
};

/* eslint-disable react/prop-types */
const SidebarWithContext = ({
  initialAppState,
  subsidyRequestsState,
  initialCourseState,
}) => (
  <AppContext.Provider value={initialAppState}>
    <SubsidyRequestsContext.Provider value={subsidyRequestsState}>
      <CourseContextProvider initialState={initialCourseState}>
        <CourseSidebarPrice />
      </CourseContextProvider>
    </SubsidyRequestsContext.Provider>
  </AppContext.Provider>
);
/* eslint-enable react/prop-types */

SidebarWithContext.propTypes = {
  initialCourseState: PropTypes.shape({}).isRequired,
  initialAppState: PropTypes.shape({}),
  subsidyRequestsState: PropTypes.shape({}),
};

SidebarWithContext.defaultProps = {
  initialAppState: appStateWithOrigPriceHidden,
  subsidyRequestsState: defaultSubsidyRequestsState,
};

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
