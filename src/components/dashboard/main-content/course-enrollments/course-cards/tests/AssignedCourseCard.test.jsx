import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import AssignedCourseCard from '../AssignedCourseCard';
import { renderWithRouter } from '../../../../../../utils/tests';

jest.mock('../../../../../app/data', () => ({
  ...jest.requireActual('../../../../../app/data'),
  useEnterpriseCustomer: jest.fn().mockReturnValue({ data: { uuid: 123 } }),
}));

const baseProps = {
  title: 'edX Demonstration Course',
  linkToCourse: 'https://edx.org',
  courseRunStatus: 'upcoming',
  courseRunId: 'my+course+key',
  courseKey: 'my+course+key',
  notifications: [],
  mode: 'verified-audit',
};

const AssignedCourseCardWrapper = (props) => (
  <IntlProvider locale="en">
    <AssignedCourseCard {...props} />
  </IntlProvider>
);

describe('<AssignedCourseCard />', () => {
  it('should render enroll button and other related content', () => {
    renderWithRouter(<AssignedCourseCardWrapper {...baseProps} />);
    expect(screen.getByText('Assigned')).toBeInTheDocument();
    expect(screen.getByText('Go to enrollment')).toBeInTheDocument();
  });
});
