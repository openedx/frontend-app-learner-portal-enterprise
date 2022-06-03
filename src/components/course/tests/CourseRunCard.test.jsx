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

import * as config from '../../../config';
import {
  COURSE_MODES_MAP,
  COURSE_AVAILABILITY_MAP,
  COURSE_PACING_MAP,
} from '../data/constants';
import CourseRunCard from '../CourseRunCard';
import { CourseContextProvider } from '../CourseContextProvider';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { SubsidyRequestsContext } from '../../enterprise-subsidy-requests/SubsidyRequestsContextProvider';
import * as subsidyRequestsHooks from '../data/hooks';
import { enrollButtonTypes } from '../enrollment/constants';

const COURSE_UUID = 'foo';
const COURSE_RUN_START = moment().format();
const COURSE_WEEKS_TO_COMPLETE = 1;
const DATE_FORMAT = 'MMM D';
const COURSE_ID = '123';

jest.mock('../../../config');
jest.mock('../enrollment/EnrollAction', () => ({ enrollLabel, enrollmentType }) => (
  <>
    <span>{enrollLabel}</span>
    <span>{enrollmentType}</span>
  </>
));
jest.mock('../data/hooks', () => ({
  useUserHasSubsidyRequestForCourse: jest.fn(() => false),
  useCourseEnrollmentUrl: jest.fn(() => false),
  useCatalogsForSubsidyRequests: jest.fn(() => []),
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

const baseSubsidyRequestCatalogsApplicableToCourse = new Set();

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
    couponCodes: {
      couponCodes: [{ discountValue: 90 }],
      couponCodesCount: 0,
    },
  },
  initialSubsidyRequestsState = {
    subsidyRequestConfiguration: {
      subsidyRequestsEnabled: true,
    },
    isLoading: false,
    catalogsForSubsidyRequests: [],
  },
  subsidyRequestCatalogsApplicableToCourse = baseSubsidyRequestCatalogsApplicableToCourse,
}) => {
  // need to use router, to render component such as react-router's <Link>
  renderWithRouter(
    <AppContext.Provider value={INITIAL_APP_STATE}>
      <SubsidyRequestsContext.Provider value={initialSubsidyRequestsState}>
        <UserSubsidyContext.Provider value={initialUserSubsidyState}>
          <CourseContextProvider initialState={courseInitState}>
            <CourseRunCard
              catalogList={['foo']}
              userEntitlements={userEntitlements}
              userEnrollments={userEnrollments}
              courseRun={courseRun}
              courseKey={COURSE_ID}
              subsidyRequestCatalogsApplicableToCourse={subsidyRequestCatalogsApplicableToCourse}
            />
          </CourseContextProvider>
        </UserSubsidyContext.Provider>
      </SubsidyRequestsContext.Provider>
    </AppContext.Provider>,
  );
};

describe('<CourseRunCard/>', () => {
  test('Course archived card', () => {
    renderCard({ courseRun: generateCourseRun({ availability: COURSE_AVAILABILITY_MAP.ARCHIVED }) });
    expect(screen.getByText('Course archived')).toBeInTheDocument();
    expect(screen.getByText('Future dates to be announced')).toBeInTheDocument();
    expect(screen.queryByText('Enroll')).not.toBeInTheDocument();
  });

  test('Course not enrollable, coming soon', () => {
    renderCard({ courseRun: generateCourseRun({ isEnrollable: false }) });
    expect(screen.getByText('Coming soon')).toBeInTheDocument();
    expect(screen.queryByText('Enroll')).toBeInTheDocument();
  });

  test('Course not enrollable and no availability', () => {
    const courseRun = generateCourseRun({
      isEnrollable: false,
      availability: '',
    });
    renderCard({ courseRun });
    expect(screen.getByText('Enrollment closed')).toBeInTheDocument();
    expect(screen.queryByText('Enroll')).toBeInTheDocument();
  });

  test('User has entitlement', () => {
    const courseRun = generateCourseRun({});
    renderCard({
      courseRun,
      userEntitlements: [{ courseUuid: COURSE_UUID }],
    });
    expect(screen.getByText('Entitlement found')).toBeInTheDocument();
    expect(screen.getByText('View on dashboard')).toBeInTheDocument();
  });

  test('Course is self paced and has started', () => {
    // If Browse/Request feature is off, user should always see the enroll button
    config.features.FEATURE_BROWSE_AND_REQUEST = false;
    const courseRun = generateCourseRun({});
    renderCard({
      courseRun,
    });
    const startDate = moment(COURSE_RUN_START).format(DATE_FORMAT);
    expect(screen.getByText(`Starts ${startDate}`)).toBeInTheDocument();
    expect(screen.getByText('Be the first to enroll!')).toBeInTheDocument();
    expect(screen.queryByText('Enroll')).toBeInTheDocument();
  });

  test('Course self is paced, has not started, and enrollment count', () => {
    // The user has a mocked subsidy from renderCard default values,
    // so they should see an enroll button.
    config.features.FEATURE_BROWSE_AND_REQUEST = true;
    const courseRunStart = moment(COURSE_RUN_START).add(1, 'd').format();
    const courseRun = generateCourseRun({
      start: courseRunStart,
      enrollmentCount: 1000,
    });
    renderCard({
      courseRun,
    });
    const startDate = moment(courseRunStart).format(DATE_FORMAT);
    expect(screen.getByText(`Starts ${startDate}`)).toBeInTheDocument();
    expect(screen.getByText('1,000 recently enrolled!')).toBeInTheDocument();
    expect(screen.queryByText('Enroll')).toBeInTheDocument();
  });

  test('User has a subsidy request for the course', () => {
    config.features.FEATURE_BROWSE_AND_REQUEST = true;
    subsidyRequestsHooks.useUserHasSubsidyRequestForCourse.mockReturnValueOnce(true);
    const courseRun = generateCourseRun({});
    renderCard({
      courseRun,
    });
    const startDate = moment(COURSE_RUN_START).format(DATE_FORMAT);
    expect(screen.getByText(`Starts ${startDate}`)).toBeInTheDocument();
    expect(screen.getByText('Be the first to enroll!')).toBeInTheDocument();
    expect(screen.getByText(enrollButtonTypes.HIDE_BUTTON)).toBeInTheDocument();
  });

  test('User must request enrollment', () => {
    // With Browse/Request feature flag on and mock-enabled for the customer,
    // the user should only see a Request Enrollment button if they have no assigned subsidies
    // and there is an applicable catalog for the configured subsidy request type.
    config.features.FEATURE_BROWSE_AND_REQUEST = true;
    const courseRun = generateCourseRun({});
    const noUserSubsidyState = {
      subscriptionLicense: null,
      couponCodes: {
        couponCodes: [],
        couponCodesCount: 0,
      },
    };
    renderCard({
      courseRun,
      initialUserSubsidyState: noUserSubsidyState,
      subsidyRequestCatalogsApplicableToCourse: new Set(['test-catalog-uuid']),
    });
    const startDate = moment(COURSE_RUN_START).format(DATE_FORMAT);
    expect(screen.getByText(`Starts ${startDate}`)).toBeInTheDocument();
    expect(screen.getByText('Be the first to enroll!')).toBeInTheDocument();
    expect(screen.getByText(enrollButtonTypes.HIDE_BUTTON)).toBeInTheDocument();
  });

  test('User must request enrollment, but course is not applicable to catalogs for configured subsidy type', () => {
    // With Browse/Request feature flag on and mock-enabled for the customer,
    // the user should NOT see a Request Enrollment button if they have no assigned
    // subsidies and there is no applicable catalog for the configured subsidy type.
    // Instead, the CTA should bring the user through the ecommerce basket flow.
    config.features.FEATURE_BROWSE_AND_REQUEST = true;
    subsidyRequestsHooks.useCourseEnrollmentUrl.mockReturnValueOnce('https://enrollment.url');
    const courseRun = generateCourseRun({});
    const noUserSubsidyState = {
      subscriptionLicense: null,
      couponCodes: {
        couponCodes: [],
        couponCodesCount: 0,
      },
    };
    renderCard({
      courseRun,
      initialUserSubsidyState: noUserSubsidyState,
      subsidyRequestCatalogsApplicableToCourse: new Set(),
    });
    const startDate = moment(COURSE_RUN_START).format(DATE_FORMAT);
    expect(screen.getByText(`Starts ${startDate}`)).toBeInTheDocument();
    expect(screen.getByText('Be the first to enroll!')).toBeInTheDocument();
    expect(screen.getByText(enrollButtonTypes.TO_ECOM_BASKET)).toBeInTheDocument();
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
    expect(screen.getByText(`Starts ${startDate}`)).toBeInTheDocument();
    expect(screen.getByText('You are enrolled')).toBeInTheDocument();
    expect(screen.getByText('View course')).toBeInTheDocument();
  });
});
