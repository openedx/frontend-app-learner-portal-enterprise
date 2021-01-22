import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import PropTypes from 'prop-types';

import { AppContext } from '@edx/frontend-platform/react';
import { CourseContextProvider } from '../CourseContextProvider';
import { UserSubsidyContext } from '../../enterprise-user-subsidy/UserSubsidy';
import CourseSidebarPrice, { INCLUDED_IN_SUBSCRIPTION_MESSAGE } from '../CourseSidebarPrice';
import { LICENSE_SUBSIDY_TYPE } from '../data/constants';

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
  userSubsidyApplicableToCourse: {},
  course: {},
  userEnrollments: [],
  userEntitlements: [],
  catalog: [],
};

const courseStateWithLicenseSubsidy = {
  ...BASE_COURSE_STATE,
  userSubsidyApplicableToCourse: { subsidyType: LICENSE_SUBSIDY_TYPE },
};

const courseStateWithOffersNoLicenseSubsidy = {
  ...BASE_COURSE_STATE,
  catalog: { catalogList: ['bears'] },
};

const courseStateWithNoOffersNoLicenseSubsidy = {
  ...BASE_COURSE_STATE,
  catalog: { catalogList: ['bears'] },
};

// eslint-disable-next-line react/prop-types
const SidebarWithContext = ({
  initialAppState = appStateWithOrigPriceHidden,
  initialCourseState,
  userSubsidyState = { offers: [] },
}) => (
  <AppContext.Provider value={initialAppState}>
    <CourseContextProvider initialState={initialCourseState}>
      <UserSubsidyContext.Provider value={userSubsidyState}>
        <CourseSidebarPrice />
      </UserSubsidyContext.Provider>
    </CourseContextProvider>
  </AppContext.Provider>
);

SidebarWithContext.propTypes = {
  initialAppState: PropTypes.shape({}).isRequired,
  initialCourseState: PropTypes.shape({}).isRequired,
  userSubsidyState: PropTypes.shape({}).isRequired,
};

const SPONSORED_BY_TEXT = 'Sponsored by test-enterprise';
const SUBSIDY_WITH_MATCHING_OFFER = {
  offers: {
    offers: [{
      code: 'bearsRus', catalog: 'bears', benefitValue: 90, usageType: 'Percentage',
    }],
  },
};

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
      initialCourseState={courseStateWithOffersNoLicenseSubsidy}
      userSubsidyState={SUBSIDY_WITH_MATCHING_OFFER}
    />);
    expect(screen.queryByText(/\$7.50 USD/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\$0.00 USD/)).not.toBeInTheDocument();
    expect(screen.queryByText(INCLUDED_IN_SUBSCRIPTION_MESSAGE)).not.toBeInTheDocument();
    expect(screen.getByText(SPONSORED_BY_TEXT)).toBeInTheDocument();
  });
  test('offer non-full subsidy, shows discounted price only, correct message', () => {
    render(<SidebarWithContext
      initialCourseState={courseStateWithOffersNoLicenseSubsidy}
      userSubsidyState={SUBSIDY_WITH_MATCHING_OFFER}
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
      initialCourseState={courseStateWithNoOffersNoLicenseSubsidy}
      initialAppState={appStateWithOrigPriceShowing}
    />);
    expect(screen.getByText(/\$7.50 USD/)).toBeInTheDocument();
  });
  test('subscription license subsidy, shows orig crossed out price, correct message', () => {
    render(<SidebarWithContext
      initialCourseState={courseStateWithLicenseSubsidy}
      initialAppState={appStateWithOrigPriceShowing}
    />);
    expect(screen.getByText(/\$7.50 USD/)).toBeInTheDocument();
  });
  test('offer 100% subsidy, shows orig price, correct message', () => {
    render(<SidebarWithContext
      initialAppState={appStateWithOrigPriceShowing}
      initialCourseState={courseStateWithOffersNoLicenseSubsidy}
      userSubsidyState={SUBSIDY_WITH_MATCHING_OFFER}
    />);
    expect(screen.getByText(/\$7.50 USD/)).toBeInTheDocument();
  });
  test('offer non-full subsidy, shows orig and discounted price only, correct message', () => {
    render(<SidebarWithContext
      initialAppState={appStateWithOrigPriceShowing}
      initialCourseState={courseStateWithOffersNoLicenseSubsidy}
      userSubsidyState={SUBSIDY_WITH_MATCHING_OFFER}
    />);
    expect(screen.getByText(/\$7.50 USD/)).toBeInTheDocument();
    expect(screen.getByText(/\$0.75 USD/)).toBeInTheDocument();
  });
});
