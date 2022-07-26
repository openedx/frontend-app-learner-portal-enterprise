/* eslint-disable react/prop-types */
import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { useLocation } from 'react-router-dom';
import {
  screen, render,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import CourseEnrollmentFailedAlert, { ENROLLMENT_SOURCE } from '../CourseEnrollmentFailedAlert';
import { CourseEnrollmentsContext } from '../../dashboard/main-content/course-enrollments/CourseEnrollmentsContextProvider';

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}));
useLocation.mockImplementation(() => ({
  search: '',
}));

const mockCourseRunKey = 'course-run-key';

const defaultAppState = {
  enterpriseConfig: {
    slug: 'test-enterprise-slug',
  },
};

const defaultCourseEnrollmentsState = {
  courseEnrollmentsByStatus: {
    inProgress: [{
      courseRunId: mockCourseRunKey,
    }],
    upcoming: [],
    completed: [],
    savedForLater: [],
    requested: [],
  },
};

const CourseEnrollmentFailedAlertWrapper = ({
  initialAppState = defaultAppState,
  initialCourseEnrollmentsState = defaultCourseEnrollmentsState,
  ...rest
}) => (
  <AppContext.Provider value={initialAppState}>
    <CourseEnrollmentsContext.Provider value={initialCourseEnrollmentsState}>
      <CourseEnrollmentFailedAlert {...rest} />
    </CourseEnrollmentsContext.Provider>
  </AppContext.Provider>
);

describe('<CourseEnrollmentFailedAlert />', () => {
  describe('Upgraded from dashboard', () => {
    const basicProps = {
      enrollmentSource: ENROLLMENT_SOURCE.DASHBOARD,
    };

    test.each`
        enrollmentFailed  | failureReason                   | expectedMessage
        ${'true'}         | ${'dsc_denied'}                 | ${'please select "Continue learning" under your course and accept the data sharing consent terms.'}
        ${'true'}         | ${'verified_mode_unavailable'}  | ${'You were not able to access your selected course as the verified course mode is unavailable'}
        ${'true'}         | ${''}                           | ${'You were not able to access your selected course.'}
    `(
      'renders $failureReason alert with `enrollment_failed=$enrollmentFailed` and `failure_reason=$failureReason`',
      ({ enrollmentFailed, failureReason, expectedMessage }) => {
        let mockedSearchString = `?enrollment_failed=${enrollmentFailed}&course_run_key=${mockCourseRunKey}`;
        if (failureReason) {
          mockedSearchString += `&failure_reason=${failureReason}`;
        }
        useLocation.mockImplementation(() => ({
          search: mockedSearchString,
        }));

        render(
          <CourseEnrollmentFailedAlertWrapper {...basicProps} />,
        );
        expect(screen.queryByRole('alert')).toBeInTheDocument();
        expect(screen.queryByText(expectedMessage, { exact: false })).toBeInTheDocument();
      },
    );
  });

  describe('Enrolled from course page', () => {
    const basicProps = {
      enrollmentSource: ENROLLMENT_SOURCE.COURSE_PAGE,
    };

    test.each`
        enrollmentFailed  | failureReason                   | expectedMessage
        ${'true'}         | ${'dsc_denied'}                 | ${'accept the data sharing consent'}
        ${'true'}         | ${'verified_mode_unavailable'}  | ${'verified course mode is unavailable'}
        ${'true'}         | ${''}                           | ${'not enrolled'}
    `(
      'renders $failureReason alert with `enrollment_failed=$enrollmentFailed` and `failure_reason=$failureReason`',
      ({ enrollmentFailed, failureReason, expectedMessage }) => {
        let mockedSearchString = `?enrollment_failed=${enrollmentFailed}`;
        if (failureReason) {
          mockedSearchString += `&failure_reason=${failureReason}`;
        }
        useLocation.mockImplementation(() => ({
          search: mockedSearchString,
        }));

        render(
          <CourseEnrollmentFailedAlertWrapper {...basicProps} />,
        );
        expect(screen.queryByRole('alert')).toBeInTheDocument();
        expect(screen.queryByText(expectedMessage, { exact: false })).toBeInTheDocument();
      },
    );
  });
});
