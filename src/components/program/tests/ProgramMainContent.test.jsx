import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { ProgramContextProvider } from '../ProgramContextProvider';
import ProgramMainContent from '../ProgramMainContent';

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}));

/* eslint-disable react/prop-types */
const ProgramMainContentWithContext = ({
  initialAppState = {},
  initialProgramState = {},
  initialUserSubsidyState = {},
}) => (
  <AppContext.Provider value={initialAppState}>
    <UserSubsidyContext.Provider value={initialUserSubsidyState}>
      <ProgramContextProvider initialState={initialProgramState}>
        <ProgramMainContent />
      </ProgramContextProvider>
    </UserSubsidyContext.Provider>
  </AppContext.Provider>
);
/* eslint-enable react/prop-types */

describe('<ProgramMainContent />', () => {
  const initialAppState = {
    enterpriseConfig: {
      slug: 'test-enterprise-slug',
    },
  };
  const initialProgramState = {
    program: {
      title: 'Test Program Title',
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

  test('renders program main content.', () => {
    render(
      <ProgramMainContentWithContext
        initialAppState={initialAppState}
        initialProgramState={initialProgramState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );

    expect(screen.getByText('Program Main Content Placeholder')).toBeInTheDocument();
  });
});
