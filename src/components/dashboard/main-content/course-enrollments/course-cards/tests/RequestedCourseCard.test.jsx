import { IntlProvider } from '@edx/frontend-platform/i18n';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import RequestedCourseCard from '../RequestedCourseCard';
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

const RequestedCourseCardWrapper = (props) => (
  <IntlProvider locale="en">
    <RequestedCourseCard {...props} />
  </IntlProvider>
);

describe('<RequestedCourseCard />', () => {
  it('should render enroll button and other related content', () => {
    renderWithRouter(<RequestedCourseCardWrapper {...baseProps} />);
    expect(screen.getByText('Requested')).toBeInTheDocument();
  });
});
