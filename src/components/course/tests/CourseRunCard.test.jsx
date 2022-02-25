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
import SubsidyRequestsContextProvider from '../../enterprise-subsidy-requests/SubsidyRequestsContextProvider';

const COURSE_UUID = 'foo';
const COURSE_RUN_START = moment().format();
const COURSE_WEEKS_TO_COMPLETE = 1;
const DATE_FORMAT = 'MMM D';
const COURSE_ID = '123';

jest.mock('../enrollment/EnrollAction', () => ({ enrollLabel }) => (<>{enrollLabel}</>));
jest.mock('../../../config');
// jest.mock('../../enterprise-subsidy-requests/data/hooks');

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
  start = COURSE_RUN_START,
}) => ({
  availability,
  pacingType,
  enrollmentCount,
  isEnrollable,
  start,
  end: moment().add(COURSE_WEEKS_TO_COMPLETE + 1, 'weeks').format(),
  key: COURSE_ID,
  seats: [{ sku: 'sku', type: COURSE_MODES_MAP.VERIFIED }],
  courseUuid: COURSE_UUID,
  weeksToComplete: COURSE_WEEKS_TO_COMPLETE,
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
          <SubsidyRequestsContextProvider>
            <CourseRunCard
              catalogList={['foo']}
              userEntitlements={userEntitlements}
              userEnrollments={userEnrollments}
              courseRun={courseRun}
            />
          </SubsidyRequestsContextProvider>
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
      availability: '',
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

  test('Course self is paced and has started', () => {
    // const courseRunStart = moment(COURSE_RUN_START).subtract(1, 'd').format();
    const courseRun = generateCourseRun({});
    renderCard({
      courseRun,
    });
    const startDate = moment(COURSE_RUN_START).format(DATE_FORMAT);
    expect(screen.getByText(`Starts ${startDate}`)).toBeTruthy();
    expect(screen.getByText('Be the first to enroll!')).toBeTruthy();
    expect(screen.queryByText('Enroll')).toBeTruthy();
  });

  test('Course self is paced, has not started, and enrollment count', () => {
    const courseRunStart = moment(COURSE_RUN_START).add(1, 'd').format();
    const courseRun = generateCourseRun({
      start: courseRunStart,
      enrollmentCount: 1000,
    });
    renderCard({
      courseRun,
    });
    expect(screen.getByText('Course started')).toBeTruthy();
    expect(screen.getByText('1,000 recently enrolled!')).toBeTruthy();
    expect(screen.queryByText('Enroll')).toBeTruthy();
  });

  test('User is enrolled, and course not started', () => {
    const courseRunStart = moment(COURSE_RUN_START).add(1, 'd').format();
    const courseRun = generateCourseRun({
      start: courseRunStart,
    });
    const startDate = moment(courseRunStart).format(DATE_FORMAT);
    renderCard({
      courseRun,
      userEnrollments: [{
        courseRunId: COURSE_ID,
        isEnrollmentActive: true,
        isRevoked: false,
        mode: 'audit',
      }],
    });
    expect(screen.getByText(`Starts ${startDate}`)).toBeTruthy();
    expect(screen.getByText('You are enrolled')).toBeTruthy();
    expect(screen.getByText('View course')).toBeTruthy();
  });
});
