import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import CourseRunCard from '../CourseRunCard';
import { CourseContext } from '../../CourseContextProvider';

jest.mock('../../data/utils', () => ({
  ...jest.requireActual('../../data/utils'),
  findUserEnrollmentForCourseRun: jest.fn(),
}));

jest.mock('../data', () => ({
  ...jest.requireActual('../data'),
  useCourseRunCardData: jest.fn().mockReturnValue({
    heading: 'Heading',
    subHeading: 'Subheading',
    action: 'Action',
  }),
}));

const mockCourseRun = {
  key: 'course-v1:edX+DemoX+Demo_Course',
  availability: 'Current',
  start: '2020-01-01T00:00:00Z',
  pacingType: 'self_paced',
  enrollmentCount: 0,
};

const CourseRunCardWrapper = (props) => {
  const courseContextValue = {
    state: {
      course: {
        entitlements: [],
      },
    },
  };
  return (
    <CourseContext.Provider value={courseContextValue}>
      <CourseRunCard
        courseRun={mockCourseRun}
        {...props}
      />
    </CourseContext.Provider>
  );
};

describe('<CourseRunCard />', () => {
  test('renders', () => {
    render(<CourseRunCardWrapper />);
    expect(screen.getByText('Heading')).toBeInTheDocument();
    expect(screen.getByText('Subheading')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });
});
