import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import AssignedCourseCard from '../AssignedCourseCard';
import { renderWithRouter } from '../../../../../../utils/tests';

jest.mock('../../../../../app/data', () => ({
  ...jest.requireActual('../../../../../app/data'),
  useEnterpriseCustomer: jest.fn().mockReturnValue({ data: { uuid: 123 } }),
}));

const basicProps = {
  title: 'edX Demonstration Course',
  linkToCourse: 'https://edx.org',
  courseRunStatus: 'upcoming',
  courseRunId: 'my+course+key',
  courseKey: 'my+course+key',
  notifications: [],
  mode: 'executive-education',
};

describe('<AssignedCourseCard />', () => {
  it('should render enroll button and other related content', () => {
    renderWithRouter(<AssignedCourseCard {...basicProps} />);
    expect(screen.getByText('Assigned')).toBeInTheDocument();
    expect(screen.getByText('Enroll')).toBeInTheDocument();
  });
});
