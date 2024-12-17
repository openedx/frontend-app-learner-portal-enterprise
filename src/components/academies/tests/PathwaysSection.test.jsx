import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import PathwaysSection from '../PathwaysSection';
import { useEnterpriseCustomer } from '../../app/data';
import { enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn().mockReturnValue({ academyUUID: '123' }),
}));
jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
}));
const pathwayData = {
  title: 'Ai for Leaders',
  overview: '<p>Pathway overview</p>',
};
const mockEnterpriseCustomer = enterpriseCustomerFactory();

describe('PathwaysSection', () => {
  it('renders pathway title and description correctly', () => {
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    render(
      <IntlProvider locale="en">
        <PathwaysSection pathwayData={pathwayData} />
      </IntlProvider>,
    );
    expect(screen.getByText('Ai for Leaders')).toBeInTheDocument();
    expect(screen.getByText('Pathway overview')).toBeInTheDocument();
  });

  it('renders launch button correctly', () => {
    render(
      <IntlProvider locale="en">
        <PathwaysSection pathwayData={pathwayData} />
      </IntlProvider>,
    );
    expect(screen.getByRole('button', { name: 'Explore Pathway' })).toBeInTheDocument();
  });

  it('opens the learner pathway modal when launch button is clicked', () => {
    render(
      <IntlProvider locale="en">
        <PathwaysSection pathwayData={pathwayData} />
      </IntlProvider>,
    );
    const launchButton = screen.getByRole('button', { name: 'Explore Pathway' });
    fireEvent.click(launchButton);
    expect(screen.getByText('Ai for Leaders')).toBeInTheDocument();
  });
});
