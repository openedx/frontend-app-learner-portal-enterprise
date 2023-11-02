import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { ProgramContextProvider } from '../ProgramContextProvider';
import ProgramMainContent from '../ProgramMainContent';

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
  useParams: jest.fn().mockReturnValue({ programUuid: '00000000-0000-0000-0000-000000000000' }),
}));

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

describe('<ProgramMainContent />', () => {
  const initialAppState = {
    enterpriseConfig: {
      slug: 'test-enterprise-slug',
    },
    authenticatedUser: {
      username: 'b.wayne',
    },
  };
  const initialProgramState = {
    program: {
      title: 'Test Program Title',
      authoringOrganizations: [],
      courses: [],
      staff: [],
      overview: '<p>A sample overview</p>',
      expectedLearningItems: ['Sample item 1', 'Sample item 2'],
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

  test('renders program overview.', () => {
    render(
      <ProgramMainContentWithContext
        initialAppState={initialAppState}
        initialProgramState={initialProgramState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );

    expect(screen.getByText('About this program')).toBeInTheDocument();
  });

  test('renders what will you learn.', () => {
    render(
      <ProgramMainContentWithContext
        initialAppState={initialAppState}
        initialProgramState={initialProgramState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );

    expect(screen.getByText('What you\'ll learn')).toBeInTheDocument();
  });
});
