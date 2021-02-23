import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { AppContext } from '@edx/frontend-platform/react';
import {
  renderWithRouter,
  initialAppState,
  initialCourseState,
} from '../../../utils/tests';

import { COURSE_MODES_MAP } from '../data/constants';
import EnrollButton from '../EnrollButton';
import { CourseContextProvider } from '../CourseContextProvider';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';

jest.mock('../../../config', () => ({
  features: { ENROLL_WITH_CODES: true },
}));

const INITIAL_APP_STATE = initialAppState({});
const defaultCourse = initialCourseState({});

const selfPacedCourseWithoutLicenseSubsidy = {
  ...defaultCourse,
  userSubsidyApplicableToCourse: null,
  activeCourseRun: {
    ...defaultCourse.activeCourseRun,
    seats: [{ sku: 'sku', type: COURSE_MODES_MAP.VERIFIED }],
  },
  catalog: { catalogList: [] },
};

describe('Enroll Button behavior', () => {
  const renderButton = ({
    AnEnrollButton,
    courseInitState = selfPacedCourseWithoutLicenseSubsidy,
    initialUserSubsidyState = {
      subscriptionLicense: null, // required to test offers case correctly!
      offers: {
        offers: [{ discountValue: 90 }],
        offersCount: 0,
      },
    },
  }) => {
    // need to use router, to render component such as react-router's <Link>
    renderWithRouter(
      <AppContext.Provider value={INITIAL_APP_STATE}>
        <UserSubsidyContext.Provider value={initialUserSubsidyState}>
          <CourseContextProvider initialState={courseInitState}>
            {AnEnrollButton}
          </CourseContextProvider>
        </UserSubsidyContext.Provider>
      </AppContext.Provider>,
    );
  };
  test('when there is no license subsidy, and there is an offer, url should be rendered', () => {
    renderButton({ AnEnrollButton: <EnrollButton /> });
    expect(screen.getByText('Enroll')).toBeInTheDocument();
    // instead of directly testing the mock call of useCourseEnrollmentUrl,
    // we test that we do render the contents of the real component (to_courseware_page) correctly
    expect(screen.getByText('Continue to payment')).toBeInTheDocument();
  });
});
