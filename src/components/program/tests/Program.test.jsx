import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { screen, render, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import Program from '../Program';
import { useAllProgramData } from '../data/hooks';

const waitForAsync = () => new Promise(resolve => setImmediate(resolve));

const programData = {
  title: 'Test Program Title',
  uuid: 'abcd-1234-213',
  authoringOrganizations: [],
  courses: [],
  staff: [],
  overview: '<p>A sample overview</p>',
};

jest.mock('react-router-dom', () => ({
  useParams: jest.fn(() => ({ programUuid: programData.uuid })),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

jest.mock('../data/hooks', () => ({
  useAllProgramData: jest.fn(),
}));

/* eslint-disable react/prop-types */
const ProgramWithContext = ({
  initialAppState = {},
  initialUserSubsidyState = {},
}) => (
  <AppContext.Provider value={initialAppState}>
    <UserSubsidyContext.Provider value={initialUserSubsidyState}>
      <Program />
    </UserSubsidyContext.Provider>
  </AppContext.Provider>
);
/* eslint-enable react/prop-types */

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
    offers: {
      offers: [],
      offersCount: 0,
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
      expect(screen.getByText('Test Program Title')).toBeInTheDocument();
    });
  });

  test('renders program error.', async () => {
    useAllProgramData.mockImplementation(() => ([{}, { message: 'This is a test message.' }]));

    await act(async () => {
      render(
        <ProgramWithContext
          initialAppState={initialAppState}
          initialUserSubsidyState={initialUserSubsidyState}
        />,
      );
      await waitForAsync();

      expect(screen.getByText('This is a test message.')).toBeInTheDocument();
      expect(screen.getByText('Try again')).toBeInTheDocument();
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
