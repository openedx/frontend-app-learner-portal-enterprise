import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { AppContext } from '@edx/frontend-platform/react';
import { CourseContextProvider } from '../CourseContextProvider';
import CourseSidebarPrice from '../CourseSidebarPrice';
import { LICENSE_SUBSIDY_TYPE } from '../data/constants';

const initialAppState = {
  enterpriseConfig: {
    slug: 'test-enterprise-slug',
  },
};

const courseStateWithLicenseSubsidy = {
  activeCourseRun: {
    firstEnrollablePaidSeatPrice: 1,
  },
  userSubsidy: { subsidyType: LICENSE_SUBSIDY_TYPE },
  course: {},
  userEnrollments: [],
  userEntitlements: [],
};

const courseStateWithOffersNoLicenseSubsidy = {
  activeCourseRun: {
    firstEnrollablePaidSeatPrice: 1,
  },
  course: {},
  userEnrollments: [],
  userEntitlements: [],
  userSubsidy: {},
};

const courseStateWithNoOffersNoLicenseSubsidy = {
  activeCourseRun: {
    firstEnrollablePaidSeatPrice: 1,
  },
  course: {},
  userEnrollments: [],
  userEntitlements: [],
  userSubsidy: {},
};

// eslint-disable-next-line react/prop-types
const SidebarWithContext = ({ initialState }) => (
  <AppContext.Provider value={initialAppState}>
    <CourseContextProvider initialState={initialState}>
      <CourseSidebarPrice />
    </CourseContextProvider>
  </AppContext.Provider>
);

describe('Sidebar price for various use cases', () => {
  test('when license subsidy is found, must show subscription price and message', () => {
    render(<SidebarWithContext initialState={courseStateWithLicenseSubsidy} />);
    expect(screen.getByText('Included in your subscription')).toBeInTheDocument();
  });
  test('when license subsidy is absent, but offer found, must show offer price and message', () => {
    render(<SidebarWithContext initialState={courseStateWithOffersNoLicenseSubsidy} />);
    expect(screen.getByText(/Sponsored by /)).toBeInTheDocument();
  });
  test('when license subsidy and offers are absent, must show original price and message', () => {
    render(<SidebarWithContext initialState={courseStateWithNoOffersNoLicenseSubsidy} />);
    expect(screen.getByText(/1.00/)).toBeInTheDocument();
  });
});
