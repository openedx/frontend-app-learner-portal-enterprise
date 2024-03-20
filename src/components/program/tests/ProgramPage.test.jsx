import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { screen, render, waitFor } from '@testing-library/react';
import { camelCaseObject } from '@edx/frontend-platform';
import { Factory } from 'rosie';
import '@testing-library/jest-dom/extend-expect';

import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import ProgramPage from '../ProgramPage';
import { useAllProgramData } from '../data/hooks';
import { PROGRAM_NOT_FOUND_MESSAGE, PROGRAM_NOT_FOUND_TITLE } from '../data/constants';
import { useEnterpriseCustomer } from '../../app/data';

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

jest.mock('react-router-dom', () => ({
  useParams: jest.fn(() => ({ programUuid: programData.uuid })),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedHttpClient: jest.fn(),
}));

jest.mock('@edx/frontend-platform/react', () => ({
  ...jest.requireActual('@edx/frontend-platform/react'),
  ErrorPage: () => <div data-testid="error-page" />,
}));

jest.mock('../data/hooks', () => ({
  useAllProgramData: jest.fn(),
}));

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
}));

const ProgramWithContext = ({
  initialAppState = {},
  initialUserSubsidyState = {},
}) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={initialAppState}>
      <UserSubsidyContext.Provider value={initialUserSubsidyState}>
        <ProgramPage />
      </UserSubsidyContext.Provider>
    </AppContext.Provider>
  </IntlProvider>
);

const mockEnterpriseCustomer = camelCaseObject(Factory.build('enterpriseCustomer'));
const mockAuthenticatedUser = camelCaseObject(Factory.build('authenticatedUser'));

const initialAppState = {
  authenticatedUser: mockAuthenticatedUser,
};

const initialUserSubsidyState = {
  subscriptionLicense: {
    uuid: 'test-license-uuid',
  },
  couponCodes: {
    couponCodes: [],
    couponCodesCount: 0,
  },
};

describe('<Program />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
  });

  test('renders program.', async () => {
    useAllProgramData.mockImplementation(() => ([{ programDetails: programData }, null]));
    render(
      <ProgramWithContext
        initialAppState={initialAppState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('About this program')).toBeInTheDocument();
      expect(screen.getByText('Test program marketing hook')).toBeInTheDocument();
    });
  });

  test('renders program error.', async () => {
    useAllProgramData.mockImplementation(() => ([{}, { message: 'This is a test message.' }]));
    render(
      <ProgramWithContext
        initialAppState={initialAppState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );
    expect(screen.getByTestId('error-page')).toBeInTheDocument();
  });

  test('renders program not found error.', async () => {
    programData.catalogContainsProgram = false;
    useAllProgramData.mockImplementation(() => ([{ programDetails: programData }, null]));

    render(
      <ProgramWithContext
        initialAppState={initialAppState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText(PROGRAM_NOT_FOUND_TITLE)).toBeInTheDocument();
      expect(screen.getByText(PROGRAM_NOT_FOUND_MESSAGE)).toBeInTheDocument();
    });
  });

  test('handle invalid data.', async () => {
    useAllProgramData.mockImplementation(() => ([null, null]));
    render(
      <ProgramWithContext
        initialAppState={initialAppState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('loading program')).toBeInTheDocument();
    });
  });
});
