import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import CourseRunCards from '../CourseRunCards';
import { CourseContext } from '../../CourseContextProvider';
import { LEARNER_CREDIT_SUBSIDY_TYPE } from '../../data/constants';

jest.mock('../CourseRunCard', () => jest.fn((props) => {
  const MockName = 'course-run-card';
  return <MockName data-testid={MockName} {...props} />;
}));
jest.mock('../deprecated/CourseRunCard', () => jest.fn((props) => {
  const MockName = 'deprecated-course-run-card';
  return <MockName data-testid={MockName} {...props} />;
}));

const mockCourseRunKey = 'course-run-key';
const mockCourseRun = {
  key: mockCourseRunKey,
  uuid: 'course-run-uuid',
};
const mockCourseKey = 'course-key';
const defaultCourseContext = {
  state: {
    availableCourseRuns: [mockCourseRun],
    userEntitlements: [],
    userEnrollments: [],
    course: { key: mockCourseKey, entitlements: [] },
    catalog: { catalogList: [] },
  },
  subsidyRequestCatalogsApplicableToCourse: [],
  missingUserSubsidyReason: undefined,
  userSubsidyApplicableToCourse: undefined,
};

const CourseRunCardsWrapper = ({ courseContexValue = defaultCourseContext }) => (
  <CourseContext.Provider value={courseContexValue}>
    <CourseRunCards />
  </CourseContext.Provider>
);

describe('<CourseRunCardStatus />', () => {
  test('renders deprecated course run card', () => {
    render(<CourseRunCardsWrapper />);
    expect(screen.getByTestId('deprecated-course-run-card')).toBeInTheDocument();
    expect(screen.queryByTestId('course-run-card')).not.toBeInTheDocument();
  });

  test('renders non-deprecated course run card with an applicable policy', () => {
    render(<CourseRunCardsWrapper
      courseContexValue={{
        ...defaultCourseContext,
        userSubsidyApplicableToCourse: {
          subsidyType: LEARNER_CREDIT_SUBSIDY_TYPE,
        },
      }}
    />);
    expect(screen.getByTestId('course-run-card')).toBeInTheDocument();
    expect(screen.queryByTestId('deprecated-course-run-card')).not.toBeInTheDocument();
  });

  test('renders non-deprecated course run card with a disabled enroll reason', () => {
    render(<CourseRunCardsWrapper
      courseContexValue={{
        ...defaultCourseContext,
        missingUserSubsidyReason: {
          userMessage: 'You cannot enroll in this course.',
        },
      }}
    />);
    expect(screen.getByTestId('course-run-card')).toBeInTheDocument();
    expect(screen.queryByTestId('deprecated-course-run-card')).not.toBeInTheDocument();
  });
});
