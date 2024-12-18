import { AppContext } from '@edx/frontend-platform/react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import ProgramHeader from '../ProgramHeader';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';
import { useEnterpriseCustomer, useProgramDetails } from '../../app/data';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn().mockReturnValue({ enterpriseSlug: 'test-enterprise-slug' }),
}));

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useProgramDetails: jest.fn(),
}));

const mockAuthenticatedUser = authenticatedUserFactory();

const initialAppState = {
  authenticatedUser: mockAuthenticatedUser,
};

const ProgramHeaderWithContext = () => (
  <AppContext.Provider value={initialAppState}>
    <ProgramHeader />
  </AppContext.Provider>
);

const initialProgramState = {
  marketingHook: 'Test program marketing hook',
  subjects: [{ slug: 'my-slug', name: 'Subject' }],
  authoringOrganizations: [{ key: 'program-key' }],
  title: 'test-title',
};
const programStateWithMultipleOrganizations = {
  marketingHook: 'Test program marketing hook',
  subjects: [{ slug: 'my-slug', name: 'Subject' }],
  authoringOrganizations: [{ key: 'program-key' }, { key: 'program-key-2' }],
  title: 'test-title',
};
const programStateWithoutSubjects = {
  marketingHook: 'Test program marketing hook',
};

const mockEnterpriseCustomer = enterpriseCustomerFactory();

describe('<ProgramHeader />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useProgramDetails.mockReturnValue({ data: initialProgramState });
  });

  test('does not render program header with marketing hook if subject is not available.', () => {
    useProgramDetails.mockReturnValue({ data: programStateWithoutSubjects });
    render(
      <ProgramHeaderWithContext />,
    );
    const marketingHook = screen.queryByText('Test program marketing hook');
    expect(marketingHook).not.toBeInTheDocument();
  });

  test('renders program header with marketing hook.', () => {
    render(
      <ProgramHeaderWithContext />,
    );
    expect(screen.getByText('Test program marketing hook')).toBeInTheDocument();
  });

  test('renders breadcrumbs', () => {
    const organizationKeyWithTitle = "program-key's test-title";
    render(
      <ProgramHeaderWithContext />,
    );
    expect(screen.getByText('Subject Courses')).toBeInTheDocument();
    expect(screen.getByText('Catalog')).toBeInTheDocument();
    expect(screen.getByText(organizationKeyWithTitle)).toBeInTheDocument();
  });

  test('renders breadcrumbs with multiple organizations', () => {
    const organizationKeyWithTitle = "program-key and program-key-2's test-title";
    useProgramDetails.mockReturnValue({ data: programStateWithMultipleOrganizations });
    render(
      <ProgramHeaderWithContext />,
    );
    expect(screen.getByText('Subject Courses')).toBeInTheDocument();
    expect(screen.getByText('Catalog')).toBeInTheDocument();
    expect(screen.getByText(organizationKeyWithTitle)).toBeInTheDocument();
  });
});
