import { AppContext } from '@edx/frontend-platform/react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import ProgramMainContent from '../ProgramMainContent';
import { useEnterpriseCustomer, useProgramDetails } from '../../app/data';
import { authenticatedUserFactory } from '../../app/data/services/data/__factories__';

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useProgramDetails: jest.fn(),
}));

const mockAuthenticatedUser = authenticatedUserFactory();

const initialAppState = {
  authenticatedUser: mockAuthenticatedUser,
};

const ProgramMainContentWrapper = () => (
  <AppContext.Provider value={initialAppState}>
    <ProgramMainContent />
  </AppContext.Provider>
);

const initialProgramState = {
  title: 'Test Program Title',
  authoringOrganizations: [],
  courses: [],
  staff: [],
  overview: '<p>A sample overview</p>',
  expectedLearningItems: ['Sample item 1', 'Sample item 2'],
};

describe('<ProgramMainContent />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: { uuid: 'test-enterprise-uuid' } });
    useProgramDetails.mockReturnValue({ data: initialProgramState });
  });

  test('renders program overview.', () => {
    render(
      <ProgramMainContentWrapper />,
    );

    expect(screen.getByText('About this program')).toBeInTheDocument();
  });

  test('renders what will you learn.', () => {
    render(
      <ProgramMainContentWrapper />,
    );

    expect(screen.getByText('What you\'ll learn')).toBeInTheDocument();
  });
});
