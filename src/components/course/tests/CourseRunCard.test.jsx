import React from 'react';
import moment from 'moment';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { AppContext } from '@edx/frontend-platform/react';
import {
  renderWithRouter,
  initialAppState,
  initialCourseState,
} from '../../../utils/tests';

import {
  COURSE_MODES_MAP,
  COURSE_AVAILABILITY_MAP,
  COURSE_PACING_MAP,
} from '../data/constants';
import CourseRunCard from '../CourseRunCard';
import { CourseContextProvider } from '../CourseContextProvider';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';

const COURSE_UUID = 'foo';
const COURSE_RUN_START = moment().format();
jest.mock('../enrollment/EnrollAction', () => ({ enrollLabel }) => (<>{enrollLabel}</>));

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

const generateCourseRun = ({
  availability = COURSE_AVAILABILITY_MAP.STARTING_SOON,
  pacingType = COURSE_PACING_MAP.SELF_PACED,
  enrollmentCount = 0,
  isEnrollable = true,
}) => ({
  availability,
  pacingType,
  courseUuid: COURSE_UUID,
  enrollmentCount,
  start: COURSE_RUN_START,
  key: '123',
  seats: [{ sku: 'sku', type: COURSE_MODES_MAP.VERIFIED }],
  isEnrollable,
});

const renderCard = ({
  courseRun,
  userEntitlements = [],
  userEnrollments = [],
  courseInitState = selfPacedCourseWithoutLicenseSubsidy,
  initialUserSubsidyState = {
    subscriptionLicense: null,
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
          <CourseRunCard
            catalogList={['foo']}
            userEntitlements={userEntitlements}
            userEnrollments={userEnrollments}
            courseRun={courseRun}
          />
        </CourseContextProvider>
      </UserSubsidyContext.Provider>
    </AppContext.Provider>,
  );
};

describe('<CourseRunCard/>', () => {
  test('Course archived card', () => {
    renderCard({ courseRun: generateCourseRun({ availability: COURSE_AVAILABILITY_MAP.ARCHIVED }) });
    expect(screen.getByText('Course archived')).toBeTruthy();
    expect(screen.getByText('Future dates to be announced')).toBeTruthy();
    expect(screen.queryByText('Enroll')).toBeFalsy();
  });

  test('Course not enrollable, coming soon', () => {
    renderCard({ courseRun: generateCourseRun({ isEnrollable: false }) });
    expect(screen.getByText('Coming soon')).toBeTruthy();
    expect(screen.queryByText('Enroll')).toBeTruthy();
  });

  test('Course not enrollable and no availability', () => {
    const courseRun = generateCourseRun({
      isEnrollable: false,
      availability: null,
    });
    renderCard({ courseRun });
    expect(screen.getByText('Enrollment closed')).toBeTruthy();
    expect(screen.queryByText('Enroll')).toBeTruthy();
  });

  test('User has entitlement', () => {
    const courseRun = generateCourseRun({});
    renderCard({
      courseRun,
      userEntitlements: [{ courseUuid: COURSE_UUID }],
    });
    expect(screen.getByText('Entitlement found')).toBeTruthy();
    expect(screen.getByText('View on dashboard')).toBeTruthy();
  });
});
