import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import ProgramPage from '../ProgramPage';
import { PROGRAM_NOT_FOUND_MESSAGE, PROGRAM_NOT_FOUND_TITLE } from '../data/constants';
import { useEnterpriseCustomer, useProgramDetails } from '../../app/data';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';

const programData = {
  title: 'Test Program Title',
  uuid: 'abcd-1234-213',
  authoringOrganizations: [],
  courses: [],
  staff: [],
  overview: '<p>A sample overview</p>',
  marketingHook: 'Test program marketing hook',
  subjects: [{ slug: 'my-slug' }],
  catalogContainsProgram: true,
  type: 'MicroMasters',
};

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useProgramDetails: jest.fn(),
}));

const mockAuthenticatedUser = authenticatedUserFactory();

const initialAppState = {
  authenticatedUser: mockAuthenticatedUser,
};

const ProgramPageWrapper = () => (
  <IntlProvider locale="en">
    <AppContext.Provider value={initialAppState}>
      <ProgramPage />
    </AppContext.Provider>
  </IntlProvider>
);

const mockEnterpriseCustomer = enterpriseCustomerFactory();

describe('<Program />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useProgramDetails.mockReturnValue({ data: programData });
  });

  test('renders program.', () => {
    render(
      <ProgramPageWrapper />,
    );
    expect(screen.getByText('About this program')).toBeInTheDocument();
    expect(screen.getByText('Test program marketing hook')).toBeInTheDocument();
  });

  test('renders program error.', () => {
    useProgramDetails.mockReturnValue({ data: {} });
    render(
      <ProgramPageWrapper />,
    );
    expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
  });

  test('renders program not found error.', () => {
    useProgramDetails.mockReturnValue({
      data: {
        catalogContainsProgram: false,
      },
    });
    render(
      <ProgramPageWrapper />,
    );
    expect(screen.getByText(PROGRAM_NOT_FOUND_TITLE)).toBeInTheDocument();
    expect(screen.getByText(PROGRAM_NOT_FOUND_MESSAGE)).toBeInTheDocument();
  });
});
