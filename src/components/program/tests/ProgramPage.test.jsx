import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { screen, render, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import ProgramPage from '../ProgramPage';
import { useAllProgramData } from '../data/hooks';
import { PROGRAM_NOT_FOUND_MESSAGE, PROGRAM_NOT_FOUND_TITLE } from '../data/constants';

const waitForAsync = () => new Promise((resolve) => { setImmediate(resolve); });

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
  getAuthenticatedUser: () => ({ username: 'b.wayne' }),
  getAuthenticatedHttpClient: jest.fn(),
}));

jest.mock('@edx/frontend-platform/react', () => ({
  ...jest.requireActual('@edx/frontend-platform/react'),
  ErrorPage: () => <div data-testid="error-page" />,
}));

jest.mock('../data/hooks', () => ({
  useAllProgramData: jest.fn(),
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

describe('<Program />', () => {
  const initialAppState = {
    enterpriseConfig: {
      slug: 'test-enterprise-slug',
      name: 'Test Enterprise',
    },
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

  test('renders program.', async () => {
    useAllProgramData.mockImplementation(() => ([{ programDetails: programData }, null]));

    await act(async () => {
      render(
        <ProgramWithContext
          initialAppState={initialAppState}
          initialUserSubsidyState={initialUserSubsidyState}
        />,
      );
      await waitForAsync();

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

    await act(async () => {
      render(
        <ProgramWithContext
          initialAppState={initialAppState}
          initialUserSubsidyState={initialUserSubsidyState}
        />,
      );
      await waitForAsync();

      expect(screen.getByText(PROGRAM_NOT_FOUND_TITLE)).toBeInTheDocument();
      expect(screen.getByText(PROGRAM_NOT_FOUND_MESSAGE)).toBeInTheDocument();
    });
  });

  test('handle invalid data.', async () => {
    useAllProgramData.mockImplementation(() => ([null, null]));

    await act(async () => {
      render(
        <ProgramWithContext
          initialAppState={initialAppState}
          initialUserSubsidyState={initialUserSubsidyState}
        />,
      );
      await waitForAsync();

      expect(screen.getByText('loading program')).toBeInTheDocument();
    });
  });
});
