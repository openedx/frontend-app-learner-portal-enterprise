import { IntlProvider } from '@edx/frontend-platform/i18n';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { camelCaseObject } from '@edx/frontend-platform/utils';
import userEvent from '@testing-library/user-event';

import PathwayProgressCard from '../PathwayProgressCard';
import LearnerPathwayProgressData from '../data/__mocks__/PathwayProgressListData.json';
import { renderWithRouter } from '../../../utils/tests';
import { useEnterpriseCustomer } from '../../app/data';
import { enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
}));

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
}));

const PathwayProgressListingCardWrapper = ({ pathwayData }) => (
  <IntlProvider locale="en">
    <PathwayProgressCard pathway={pathwayData} />
  </IntlProvider>
);

const pathwayData = camelCaseObject(LearnerPathwayProgressData[0]);
const mockEnterpriseCustomer = enterpriseCustomerFactory();

describe('<PathwayProgressCard />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
  });

  it('renders all data related to pathway progress correctly', () => {
    renderWithRouter(<PathwayProgressListingCardWrapper pathwayData={pathwayData} />);
    const { learnerPathwayProgress } = pathwayData;
    expect(screen.getByText(learnerPathwayProgress.title)).toBeInTheDocument();
    const cardImageNode = screen.getByAltText('dug');
    expect(cardImageNode).toHaveAttribute('src', learnerPathwayProgress.cardImage);
    expect(screen.getByText('Remaining')).toBeInTheDocument();
    expect(screen.getByTestId('remaining-count')).toHaveTextContent('1');
    expect(screen.getByText('In progress')).toBeInTheDocument();
    expect(screen.getByTestId('in-progress-count')).toHaveTextContent('3');
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByTestId('completed-count')).toHaveTextContent('1');
  });

  it('redirects to correct page when clicked', () => {
    renderWithRouter(<PathwayProgressListingCardWrapper pathwayData={pathwayData} />);
    userEvent.click(screen.getByTestId('pathway-progress-listing-card'));
    expect(window.location.pathname).toEqual(`/${mockEnterpriseCustomer.slug}/pathway/0a017cbe-0f1c-4e5f-9095-2101823fac93/progress`);
  });
});
