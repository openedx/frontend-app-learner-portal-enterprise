import { IntlProvider } from '@edx/frontend-platform/i18n';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import ApprovedCourseCard from '../ApprovedCourseCard';
import { renderWithRouter } from '../../../../../../utils/tests';

jest.mock('../../../../../app/data', () => ({
  ...jest.requireActual('../../../../../app/data'),
  useEnterpriseCustomer: jest.fn().mockReturnValue({ data: { uuid: 123 } }),
}));

const baseProps = {
  linkToCourse: 'https://edx.org',
};

const ApprovedCourseCardWrapper = (props) => (
  <IntlProvider locale="en">
    <ApprovedCourseCard {...props} />
  </IntlProvider>
);

describe('<ApprovedCourseCard />', () => {
  it('should render enroll button and other related content', () => {
    renderWithRouter(<ApprovedCourseCardWrapper {...baseProps} />);
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('Enroll')).toBeInTheDocument();
  });
});
