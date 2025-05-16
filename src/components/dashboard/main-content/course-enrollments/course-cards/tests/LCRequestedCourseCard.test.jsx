import { IntlProvider } from '@edx/frontend-platform/i18n';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import LCRequestedCourseCard from '../LCRequestedCourseCard';
import { renderWithRouter } from '../../../../../../utils/tests';

jest.mock('../../../../../app/data', () => ({
  ...jest.requireActual('../../../../../app/data'),
  useEnterpriseCustomer: jest.fn().mockReturnValue({ data: { uuid: 123 } }),
}));

const baseProps = {
  linkToCourse: 'https://edx.org',
};

const LCRequestedCourseCardWrapper = (props) => (
  <IntlProvider locale="en">
    <LCRequestedCourseCard {...props} />
  </IntlProvider>
);

describe('<LCRequestedCourseCard />', () => {
  it('should render enroll button and other related content', () => {
    renderWithRouter(<LCRequestedCourseCardWrapper {...baseProps} />);
    expect(screen.getByText('Requested')).toBeInTheDocument();
    expect(screen.getByText('Enroll')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enroll' })).toBeDisabled();
  });
});
