import React from 'react';
import { render, screen } from '@testing-library/react';
import PathwayRequirements from '../PathwayRequirements';
import { PathwayProgressContext } from '../PathwayProgressContextProvider';
import '@testing-library/jest-dom';

const mockLearnerPathwayProgress = {
  steps: [
    {
      courses: [
        {
          key: 'course1',
          courseRuns: [{ key: 'course-run1' }],
          title: 'Course 1',
          shortDescription: 'Short description 1',
          cardImageUrl: 'image1.jpg',
          contentType: 'course',
        },
      ],
      programs: [
        {
          uuid: 'program1',
          title: 'Program 1',
          shortDescription: 'Short description 1',
          cardImageUrl: 'image1.jpg',
          contentType: 'program',
          courses: [
            {
              key: 'course2',
              courseRuns: [{ key: 'course-run2' }],
            },
          ],
          status: 'NOT_STARTED',
          enterprises: '["enterprise1"]',
        },
      ],
    },
    {
      courses: [
        {
          key: 'course3',
          courseRuns: [{ key: 'course-run3' }],
          title: 'Course 3',
          shortDescription: 'Short description 3',
          cardImageUrl: 'image3.jpg',
          contentType: 'course',
        },
      ],
      programs: [],
    },
  ],
};

test('renders pathway requirements correctly', () => {
  render(
    <PathwayProgressContext.Provider value={{ learnerPathwayProgress: mockLearnerPathwayProgress }}>
      <PathwayRequirements />
    </PathwayProgressContext.Provider>,
  );

  expect(screen.getByText('Pathway Requirements:')).toBeInTheDocument();
  expect(screen.getByText('Course 1')).toBeInTheDocument();
  expect(screen.getByText('Program 1')).toBeInTheDocument();
  expect(screen.getByText('Course 3')).toBeInTheDocument();
});

test('renders pathway steps correctly', () => {
  render(
    <PathwayProgressContext.Provider value={{ learnerPathwayProgress: mockLearnerPathwayProgress }}>
      <PathwayRequirements />
    </PathwayProgressContext.Provider>,
  );

  expect(screen.getByText('Requirement 1: Choose any 2 of the following')).toBeInTheDocument();
});
