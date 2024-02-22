import React from 'react';
import { render, screen } from '@testing-library/react';
import PathwayStep from '../PathwayStep';
import '@testing-library/jest-dom';

const singleNode = [
  {
    uuid: 'some-uuid',
    title: 'Programming & Data Structures',
    shortDescription: '',
    cardImageUrl:
            'image.jpg',
    contentType: 'program',
    courses: [
      {
        key: 'key',
        courseRuns: [{ key: 'some-key' }],
      },
    ],
    status: 'NOT_STARTED',
    enterprises: '[]',
  },
];
const multipleNodes = [
  {
    key: 'some-course-key',
    courseRuns: [{ key: 'course-run-key' }],
    title: 'Applied Scrum for Agile Project Management',
    shortDescription:
        '<p>Some short description</p>',
    cardImageUrl:
        'image.jpg',
    contentType: 'course',
  },
  {
    uuid: 'some-programe-uuid',
    title: 'Data Engineering Fundamentals',
    shortDescription: '',
    cardImageUrl:
        'image.png',
    contentType: 'program',
    courses: [
      {
        key: 'IBM+DB0100EN',
        courseRuns: [{ key: 'some-course-run-key' }],
      },
    ],
    status: 'NOT_STARTED',
    enterprises: '["test-enterprise-uuid"]',
  },
];
describe('<PathwayStep />', () => {
  test('renders the correct title when there is only one node', () => {
    render(<PathwayStep index={0} nodes={singleNode} />);
    expect(screen.getByText('Requirement 1')).toBeInTheDocument();
    expect(screen.queryByText('Choose any 1 of the following')).not.toBeInTheDocument();
  });

  test('renders the correct title when there are multiple nodes', () => {
    render(<PathwayStep index={0} nodes={multipleNodes} />);
    expect(screen.getByText('Requirement 1: Choose any 2 of the following')).toBeInTheDocument();
  });
});
