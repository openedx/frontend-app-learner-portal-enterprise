import React from 'react';
import moment from 'moment';
import { AppContext } from '@edx/frontend-platform/react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { UserSubsidyContext } from '../../enterprise-user-subsidy/UserSubsidy';
import { CourseContextProvider } from '../CourseContextProvider';

import EnrollButton from '../EnrollButton';

import { renderWithRouter } from '../../../utils/tests';

import {
  COURSE_AVAILABILITY_MAP,
  COURSE_MODES_MAP,
  COURSE_PACING_MAP,
  ENROLL_BUTTON_LABEL_COMING_SOON,
  ENROLL_BUTTON_LABEL_NOT_AVAILABLE,
} from '../data/constants';

/* eslint-disable react/prop-types */
const EnrollButtonWithContext = ({
  initialAppState = {},
  initialCourseState = {},
  initialUserSubsidyState = {},
}) => (
  <AppContext.Provider value={initialAppState}>
    <UserSubsidyContext.Provider value={initialUserSubsidyState}>
      <CourseContextProvider initialState={initialCourseState}>
        <EnrollButton />
      </CourseContextProvider>
    </UserSubsidyContext.Provider>
  </AppContext.Provider>
);
/* eslint-enable react/prop-types */

describe('<EnrollButton />', () => {
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
      start: moment().subtract(1, 'w').toISOString(),
      end: moment().add(8, 'w').toISOString(),
      availability: 'Current',
      courseUuid: 'Foo',
      weeksToComplete: 4,
    },
    userEnrollments: [],
    userEntitlements: [],
    catalog: {},
  };
  const initialUserSubsidyState = {
    subscriptionLicense: {
      uuid: 'test-license-uuid',
    },
    offers: {
      isLoading: false,
      offers: [],
      offersCount: 0,
    },
  };

  describe('with non-enrollable course run', () => {
    test('renders "Coming Soon" button label with "Upcoming" availability', () => {
      const courseState = {
        ...initialCourseState,
        activeCourseRun: {
          ...initialCourseState.activeCourseRun,
          isEnrollable: false,
          availability: COURSE_AVAILABILITY_MAP.UPCOMING,
        },
      };

      renderWithRouter(
        <EnrollButtonWithContext
          initialAppState={initialAppState}
          initialCourseState={courseState}
          initialUserSubsidyState={initialUserSubsidyState}
        />,
      );

      expect(screen.getByText(ENROLL_BUTTON_LABEL_COMING_SOON));
    });

    test('renders "Coming Soon" button label with "Starting Soon" availability', () => {
      const courseState = {
        ...initialCourseState,
        activeCourseRun: {
          ...initialCourseState.activeCourseRun,
          isEnrollable: false,
          availability: COURSE_AVAILABILITY_MAP.STARTING_SOON,
        },
      };

      renderWithRouter(
        <EnrollButtonWithContext
          initialAppState={initialAppState}
          initialCourseState={courseState}
          initialUserSubsidyState={initialUserSubsidyState}
        />,
      );

      expect(screen.getByText(ENROLL_BUTTON_LABEL_COMING_SOON));
    });

    test('renders "Not Currently Available" button label', () => {
      const courseState = {
        ...initialCourseState,
        activeCourseRun: {
          ...initialCourseState.activeCourseRun,
          isEnrollable: false,
          availability: '',
        },
      };

      renderWithRouter(
        <EnrollButtonWithContext
          initialAppState={initialAppState}
          initialCourseState={courseState}
          initialUserSubsidyState={initialUserSubsidyState}
        />,
      );

      expect(screen.getByText(ENROLL_BUTTON_LABEL_NOT_AVAILABLE));
    });
  });

  describe('with enrollable course run', () => {
    test('renders with start date of today for self-paced course', () => {
      renderWithRouter(
        <EnrollButtonWithContext
          initialAppState={initialAppState}
          initialCourseState={initialCourseState}
          initialUserSubsidyState={initialUserSubsidyState}
        />,
      );

      expect(screen.getByText('Enroll'));
      const now = moment();
      expect(screen.getByText(`Starts ${now.format('MMM D, YYYY')}`, { exact: false }));
    });

    test('renders with correct start date for instructor-paced course', () => {
      const courseState = {
        ...initialCourseState,
        activeCourseRun: {
          ...initialCourseState.activeCourseRun,
          pacingType: COURSE_PACING_MAP.INSTRUCTOR_PACED,
        },
      };

      renderWithRouter(
        <EnrollButtonWithContext
          initialAppState={initialAppState}
          initialCourseState={courseState}
          initialUserSubsidyState={initialUserSubsidyState}
        />,
      );

      expect(screen.getByText('Enroll'));
      const formattedStartDate = moment(initialCourseState.activeCourseRun.start).format('MMM D, YYYY');
      expect(screen.getByText(`Started ${formattedStartDate}`, { exact: false }));
    });
  });

  describe('with already enrolled course', () => {
    const userEnrollment = {
      mode: COURSE_MODES_MAP.VERIFIED,
      isActive: true,
      courseDetails: {
        courseId: initialCourseState.activeCourseRun.key,
      },
    };

    test('renders with "You are Enrolled"', () => {
      const courseState = {
        ...initialCourseState,
        activeCourseRun: {
          ...initialCourseState.activeCourseRun,
          start: moment().add(1, 'w').toISOString(),
        },
        userEnrollments: [userEnrollment],
      };

      renderWithRouter(
        <EnrollButtonWithContext
          initialAppState={initialAppState}
          initialCourseState={courseState}
          initialUserSubsidyState={initialUserSubsidyState}
        />,
      );

      expect(screen.getByText('You are Enrolled'));
    });

    test('renders with "View Course"', () => {
      const courseState = {
        ...initialCourseState,
        userEnrollments: [userEnrollment],
      };

      renderWithRouter(
        <EnrollButtonWithContext
          initialAppState={initialAppState}
          initialCourseState={courseState}
          initialUserSubsidyState={initialUserSubsidyState}
        />,
      );

      expect(screen.getByText('View Course'));
    });

    test('renders with course info link for non-Audit track course with subscription license', () => {
      const courseState = {
        ...initialCourseState,
        userEnrollments: [userEnrollment],
      };

      renderWithRouter(
        <EnrollButtonWithContext
          initialAppState={initialAppState}
          initialCourseState={courseState}
          initialUserSubsidyState={initialUserSubsidyState}
        />,
      );

      expect(screen.getByText('View Course'));
      const actualUrl = screen.getByText('View Course').closest('a').href;
      expect(actualUrl).toContain(`courses/${initialCourseState.activeCourseRun.key}/info`);
    });

    test('renders with enrollment link for Audit track course with subscription license', () => {
      const courseState = {
        ...initialCourseState,
        userEnrollments: [{
          ...userEnrollment,
          mode: COURSE_MODES_MAP.AUDIT,
        }],
      };

      renderWithRouter(
        <EnrollButtonWithContext
          initialAppState={initialAppState}
          initialCourseState={courseState}
          initialUserSubsidyState={initialUserSubsidyState}
        />,
      );

      expect(screen.getByText('View Course'));
      const actualUrl = screen.getByText('View Course').closest('a').href;
      expect(actualUrl).toContain('grant_data_sharing_permissions');
      expect(actualUrl).toContain(`course_id=${initialCourseState.activeCourseRun.key}`);
      expect(actualUrl).toContain(`license_uuid=${initialUserSubsidyState.subscriptionLicense.uuid}`);
    });
  });
});
