import React from 'react';
import * as reactRedux from 'react-redux';
import moment from 'moment';
import { AppContext } from '@edx/frontend-platform/react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { UserSubsidyContext } from '../../enterprise-user-subsidy/UserSubsidy';
import { CourseContextProvider } from '../CourseContextProvider';

import EnrollButton, { getEnrollmentUrl } from '../EnrollButton';

import { renderWithRouter } from '../../../utils/tests';

import {
  COURSE_AVAILABILITY_MAP,
  COURSE_PACING_MAP,
  ENROLL_BUTTON_LABEL_COMING_SOON,
  ENROLL_BUTTON_LABEL_NOT_AVAILABLE,
} from '../data/constants';

jest.mock('../../dashboard/sidebar/offers', () => ({
  fetchOffers: () => {},
}));

const mockStore = configureMockStore([thunk]);

/* eslint-disable react/prop-types */
const EnrollButtonWithContext = ({
  initialAppState = {},
  initialCourseState = {},
  initialUserSubsidyState = {},
  initialReduxStore = {},
}) => (
  <AppContext.Provider value={initialAppState}>
    <UserSubsidyContext.Provider value={initialUserSubsidyState}>
      <CourseContextProvider initialState={initialCourseState}>
        <reactRedux.Provider store={mockStore(initialReduxStore)}>
          <EnrollButton />
        </reactRedux.Provider>
      </CourseContextProvider>
    </UserSubsidyContext.Provider>
  </AppContext.Provider>
);
/* eslint-enable react/prop-types */

describe('<EnrollButton />', () => {
  // eslint-disable-next-line no-unused-vars
  let useDispatchSpy;
  const initialAppState = {
    enterpriseConfig: {
      slug: 'test-enterprise-slug',
    },
  };
  const initialCourseState = {
    course: {},
    activeCourseRun: {
      key: 'test-course-run-key',
      isEnrollable: true,
      pacingType: COURSE_PACING_MAP.SELF_PACED,
    },
    userEnrollments: [],
    userEntitlements: [],
    catalog: {},
  };
  const initialUserSubsidyState = {
    subscriptionLicense: {
      uuid: 'test-license-uuid',
    },
  };
  const initialReduxStore = {
    offers: {
      isLoading: false,
      offers: [],
      offersCount: 0,
    },
  };
  beforeAll(() => {
    useDispatchSpy = jest.spyOn(reactRedux, 'useDispatch').mockReturnValue(() => {});
  });
  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('with non-enrollable course run', () => {
    test('renders "Coming Soon" button label', () => {
      const availabilityStates = [
        COURSE_AVAILABILITY_MAP.UPCOMING,
        COURSE_AVAILABILITY_MAP.STARTING_SOON,
      ];

      availabilityStates.forEach((availability) => {
        const courseState = {
          ...initialCourseState,
          activeCourseRun: {
            isEnrollable: false,
            availability,
          },
        };

        renderWithRouter(
          <EnrollButtonWithContext
            initialAppState={initialAppState}
            initialCourseState={courseState}
            initialUserSubsidyState={initialUserSubsidyState}
            initialReduxStore={initialReduxStore}
          />,
        );

        expect(screen.queryByText(ENROLL_BUTTON_LABEL_COMING_SOON));
      });
    });

    test('renders "Not Yet Available" button label', () => {
      const courseState = {
        ...initialCourseState,
        activeCourseRun: {
          isEnrollable: false,
          availability: null,
        },
      };

      renderWithRouter(
        <EnrollButtonWithContext
          initialAppState={initialAppState}
          initialCourseState={courseState}
          initialUserSubsidyState={initialUserSubsidyState}
          initialReduxStore={initialReduxStore}
        />,
      );

      expect(screen.queryByText(ENROLL_BUTTON_LABEL_NOT_AVAILABLE));
    });
  });

  describe('with enrollable course run', () => {
    test('renders with start date of today for self-paced course', () => {
      renderWithRouter(
        <EnrollButtonWithContext
          initialAppState={initialAppState}
          initialCourseState={initialCourseState}
          initialUserSubsidyState={initialUserSubsidyState}
          initialReduxStore={initialReduxStore}
        />,
      );

      expect(screen.queryByText('Enroll'));

      const now = moment();
      expect(screen.queryByText(`Starts ${now.format('MMM D, YYYY')}`, { exact: false }));
    });

    test('renders with correct start date for instructor-paced course', () => {
      const courseStartDate = '2020-07-15';
      const courseState = {
        ...initialCourseState,
        activeCourseRun: {
          ...initialCourseState.activeCourseRun,
          pacingType: COURSE_PACING_MAP.INSTRUCTOR_PACED,
          start: courseStartDate,
        },
      };

      renderWithRouter(
        <EnrollButtonWithContext
          initialAppState={initialAppState}
          initialCourseState={courseState}
          initialUserSubsidyState={initialUserSubsidyState}
          initialReduxStore={initialReduxStore}
        />,
      );

      expect(screen.queryByText('Enroll'));
      const formattedStartDate = moment(courseStartDate).format('MMM D, YYYY');
      expect(screen.queryByText(`Started ${formattedStartDate}`, { exact: false }));
    });
  });

  describe('with already enrolled course', () => {
    test('renders with "You are Enrolled"', () => {
      const courseRunKey = 'test-course-run-key';
      const courseState = {
        ...initialCourseState,
        activeCourseRun: {
          ...initialCourseState.activeCourseRun,
          key: courseRunKey,
          start: moment().subtract(1, 'w'),
        },
        userEnrollments: [{
          courseDetails: {
            courseId: courseRunKey,
          },
        }],
      };

      renderWithRouter(
        <EnrollButtonWithContext
          initialAppState={initialAppState}
          initialCourseState={courseState}
          initialUserSubsidyState={initialUserSubsidyState}
          initialReduxStore={initialReduxStore}
        />,
      );

      expect(screen.queryByText('You are Enrolled'));
    });

    test('renders with "View Course"', () => {
      const courseRunKey = 'test-course-run-key';
      const courseState = {
        ...initialCourseState,
        activeCourseRun: {
          ...initialCourseState.activeCourseRun,
          key: courseRunKey,
          start: moment().add(1, 'w'),
        },
        userEnrollments: [{
          courseDetails: {
            courseId: courseRunKey,
          },
        }],
      };

      renderWithRouter(
        <EnrollButtonWithContext
          initialAppState={initialAppState}
          initialCourseState={courseState}
          initialUserSubsidyState={initialUserSubsidyState}
          initialReduxStore={initialReduxStore}
        />,
      );

      expect(screen.queryByText('View Course'));
    });
  });
  describe('getEnrollmentUrl', () => {
    const noSubscriptionEnrollmentInputs = {
      enterpriseConfig: {
        uuid: 'foo',
      },
      key: 'bar',
      offers: [{ code: 'bearsRus' }],
      offersCount: 2,
      offersLoading: false,
      sku: 'xkcd',
    };
    const enrollmentInputs = {
      ...noSubscriptionEnrollmentInputs,
      subscriptionLicense: {
        uuid: 'yes',
      },
    };
    it('Subscription: returns an lms url with correct querystring', () => {
      const url = getEnrollmentUrl(enrollmentInputs);
      expect(url).toContain(process.env.LMS_BASE_URL);
      expect(url).toContain(enrollmentInputs.enterpriseConfig.uuid);
      expect(url).toContain(enrollmentInputs.key);
      expect(url).toContain(enrollmentInputs.subscriptionLicense.uuid);
    });
    it('No subscription with offers: returns an ecommerce url with correct querystring', () => {
      const url = getEnrollmentUrl(noSubscriptionEnrollmentInputs);
      expect(url).toContain(process.env.ECOMMERCE_BASE_URL);
      expect(url).toContain(noSubscriptionEnrollmentInputs.sku);
      expect(url).toContain(noSubscriptionEnrollmentInputs.offers[0].code);
    });
    it('No subscription no offers: returns an ecommerce url with correct querystring', () => {
      const url = getEnrollmentUrl({ ...noSubscriptionEnrollmentInputs, offersCount: 0 });
      expect(url).toContain(process.env.ECOMMERCE_BASE_URL);
      expect(url).toContain(noSubscriptionEnrollmentInputs.sku);
      expect(url).not.toContain('code');
    });
    it('No subscription: returns null if offers are loading', () => {
      const url = getEnrollmentUrl({ ...noSubscriptionEnrollmentInputs, offersLoading: true });
      expect(url).toBeNull();
    });
    it('No subscription: returns null sku is missing', () => {
      const url = getEnrollmentUrl({ ...noSubscriptionEnrollmentInputs, sku: undefined });
      expect(url).toBeNull();
    });
  });
});
