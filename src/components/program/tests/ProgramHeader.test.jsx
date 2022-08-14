import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { ProgramContextProvider } from '../ProgramContextProvider';
import ProgramHeader from '../ProgramHeader';

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
  useParams: jest.fn().mockReturnValue({ enterpriseSlug: 'test-enterprise-slug' }),
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
      subjects: [{ slug: 'my-slug', name: 'Subject' }],
      authoringOrganizations: [{ key: 'program-key' }],
      title: 'test-title',
    },
  };
  const programStateWithMultipleOrganizations = {
    program: {
      marketingHook: 'Test program marketing hook',
      subjects: [{ slug: 'my-slug', name: 'Subject' }],
      authoringOrganizations: [{ key: 'program-key' }, { key: 'program-key-2' }],
      title: 'test-title',
    },
  };
  const programStateWithoutSubjects = {
    program: {
      marketingHook: 'Test program marketing hook',
    },
  };
  const initialUserSubsidyState = {
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

  test('renders breadcrumbs', () => {
    const organizationKeyWithTitle = "program-key's test-title";
    render(
      <ProgramHeaderWithContext
        initialAppState={initialAppState}
        initialProgramState={initialProgramState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );
    expect(screen.getByText('Subject Courses')).toBeInTheDocument();
    expect(screen.getByText('Catalog')).toBeInTheDocument();
    expect(screen.getByText(organizationKeyWithTitle)).toBeInTheDocument();
  });

  test('renders breadcrumbs with multiple organizations', () => {
    const organizationKeyWithTitle = "program-key and program-key-2's test-title";
    render(
      <ProgramHeaderWithContext
        initialAppState={initialAppState}
        initialProgramState={programStateWithMultipleOrganizations}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );
    expect(screen.getByText('Subject Courses')).toBeInTheDocument();
    expect(screen.getByText('Catalog')).toBeInTheDocument();
    expect(screen.getByText(organizationKeyWithTitle)).toBeInTheDocument();
  });
});
