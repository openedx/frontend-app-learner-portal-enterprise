import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import PropTypes from 'prop-types';

import { AppContext } from '@edx/frontend-platform/react';
import { CourseContextProvider } from '../CourseContextProvider';
import CourseSidebarPrice, { INCLUDED_IN_SUBSCRIPTION_MESSAGE } from '../CourseSidebarPrice';
import {
  LICENSE_SUBSIDY_TYPE,
  OFFER_SUBSIDY_TYPE,
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
  catalog: [],
};

const courseStateWithLicenseSubsidy = {
  ...BASE_COURSE_STATE,
  userSubsidyApplicableToCourse: { subsidyType: LICENSE_SUBSIDY_TYPE },
};

// making discountType uppercase to help validate case-safe check in hooks logic
const FULL_OFFER_SUBSIDY = {
  discountType: SUBSIDY_DISCOUNT_TYPE_MAP.PERCENTAGE.toUpperCase(),
  discountValue: 100,
  subsidyType: OFFER_SUBSIDY_TYPE,
};

const PARTIAL_OFFER_SUBSIDY = {
  ...FULL_OFFER_SUBSIDY,
  discountValue: 90,
};

const courseStateFullOfferSubsidy = {
  ...BASE_COURSE_STATE,
  catalog: { catalogList: ['bears'] },
  userSubsidyApplicableToCourse: FULL_OFFER_SUBSIDY,
};

const courseStatePartialOfferSubsidy = {
  ...BASE_COURSE_STATE,
  catalog: { catalogList: ['bears'] },
  userSubsidyApplicableToCourse: PARTIAL_OFFER_SUBSIDY,
};

const courseStateWithNoOffersNoLicenseSubsidy = {
  ...BASE_COURSE_STATE,
  catalog: { catalogList: ['bears'] },
};

// eslint-disable-next-line react/prop-types
const SidebarWithContext = ({
  initialAppState = appStateWithOrigPriceHidden,
  initialCourseState,
}) => (
  <AppContext.Provider value={initialAppState}>
    <CourseContextProvider initialState={initialCourseState}>
      <CourseSidebarPrice />
    </CourseContextProvider>
  </AppContext.Provider>
);

SidebarWithContext.propTypes = {
  initialAppState: PropTypes.shape({}).isRequired,
  initialCourseState: PropTypes.shape({}).isRequired,
  userSubsidyState: PropTypes.shape({}).isRequired,
};

const SPONSORED_BY_TEXT = 'Sponsored by test-enterprise';

describe('Sidebar price display with hideCourseOriginalPrice ON, No subsidies', () => {
  test('no subsidies, shows original price, no messages', () => {
    render(<SidebarWithContext initialCourseState={courseStateWithNoOffersNoLicenseSubsidy} />);
    expect(screen.getByText(/\$7.50 USD/)).toBeInTheDocument();
    expect(screen.queryByText(INCLUDED_IN_SUBSCRIPTION_MESSAGE)).not.toBeInTheDocument();
    expect(screen.queryByText(SPONSORED_BY_TEXT)).not.toBeInTheDocument();
  });
});

describe('Sidebar price display with hideCourseOriginalPrice ON', () => {
  test('subscription license subsidy, shows no price, correct message', () => {
    render(<SidebarWithContext initialCourseState={courseStateWithLicenseSubsidy} />);
    expect(screen.queryByText(/\$7.50 USD/)).not.toBeInTheDocument();
    expect(screen.getByText(INCLUDED_IN_SUBSCRIPTION_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText(SPONSORED_BY_TEXT)).not.toBeInTheDocument();
  });
  test('offer 100% subsidy, shows no price, correct message', () => {
    render(<SidebarWithContext
      initialCourseState={courseStateFullOfferSubsidy}
    />);
    expect(screen.queryByText(/\$7.50 USD/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\$0.00 USD/)).not.toBeInTheDocument();
    expect(screen.queryByText(INCLUDED_IN_SUBSCRIPTION_MESSAGE)).not.toBeInTheDocument();
    expect(screen.getByText(SPONSORED_BY_TEXT)).toBeInTheDocument();
  });
  test('offer non-full subsidy, shows discounted price only, correct message', () => {
    render(<SidebarWithContext
      initialCourseState={courseStatePartialOfferSubsidy}
    />);
    expect(screen.getByText(/\$0.75 USD/)).toBeInTheDocument();
    expect(screen.queryByText(INCLUDED_IN_SUBSCRIPTION_MESSAGE)).not.toBeInTheDocument();
    expect(screen.getByText(SPONSORED_BY_TEXT)).toBeInTheDocument();
  });
});

// We only test price here, since messages are already tested above
describe('Sidebar price display with hideCourseOriginalPrice OFF', () => {
  test('no subsidies, shows original price, no messages', () => {
    render(<SidebarWithContext
      initialAppState={appStateWithOrigPriceShowing}
      initialCourseState={courseStateWithNoOffersNoLicenseSubsidy}
    />);
    expect(screen.getByText(/\$7.50 USD/)).toBeInTheDocument();
  });
  test('subscription license subsidy, shows orig crossed out price, correct message', () => {
    render(<SidebarWithContext
      initialAppState={appStateWithOrigPriceShowing}
      initialCourseState={courseStateWithLicenseSubsidy}
    />);
    expect(screen.getByText(/\$7.50 USD/)).toBeInTheDocument();
  });
  test('offer 100% subsidy, shows orig price, correct message', () => {
    render(<SidebarWithContext
      initialAppState={appStateWithOrigPriceShowing}
      initialCourseState={courseStateFullOfferSubsidy}
    />);
    expect(screen.getByText(/\$7.50 USD/)).toBeInTheDocument();
  });
  test('offer non-full subsidy, shows orig and discounted price only, correct message', () => {
    render(<SidebarWithContext
      initialAppState={appStateWithOrigPriceShowing}
      initialCourseState={courseStatePartialOfferSubsidy}
    />);
    expect(screen.getByText(/\$7.50 USD/)).toBeInTheDocument();
    expect(screen.getByText(/\$0.75 USD/)).toBeInTheDocument();
  });
});
