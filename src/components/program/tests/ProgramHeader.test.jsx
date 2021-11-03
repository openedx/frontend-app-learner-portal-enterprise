import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { ProgramContextProvider } from '../ProgramContextProvider';
import ProgramHeader from '../ProgramHeader';

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}));

/* eslint-disable react/prop-types */
const ProgramHeaderWithContext = ({
  initialAppState = {},
  initialProgramState = {},
  initialUserSubsidyState = {},
}) => (
  <AppContext.Provider value={initialAppState}>
    <UserSubsidyContext.Provider value={initialUserSubsidyState}>
      <ProgramContextProvider initialState={initialProgramState}>
        <ProgramHeader />
      </ProgramContextProvider>
    </UserSubsidyContext.Provider>
  </AppContext.Provider>
);
/* eslint-enable react/prop-types */

describe('<ProgramHeader />', () => {
  const initialAppState = {
    enterpriseConfig: {
      slug: 'test-enterprise-slug',
    },
  };
  const initialProgramState = {
    program: {
      marketingHook: 'Test program marketing hook',
      subjects: [{ slug: 'my-slug' }],
    },
  };
  const programStateWithoutSubjects = {
    program: {
      marketingHook: 'Test program marketing hook',
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

  test('does not render program header with marketing hook if subject is not available.', () => {
    render(
      <ProgramHeaderWithContext
        initialAppState={initialAppState}
        initialProgramState={programStateWithoutSubjects}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );
    const marketingHook = screen.queryByText('Test program marketing hook');
    expect(marketingHook).not.toBeInTheDocument();
  });

  test('renders program header with marketing hook.', () => {
    render(
      <ProgramHeaderWithContext
        initialAppState={initialAppState}
        initialProgramState={initialProgramState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );
    expect(screen.getByText('Test program marketing hook')).toBeInTheDocument();
  });
});
