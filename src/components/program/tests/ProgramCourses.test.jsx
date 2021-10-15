import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { ProgramContextProvider } from '../ProgramContextProvider';
import ProgramCourses from '../ProgramCourses';

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}));

/* eslint-disable react/prop-types */
const ProgramCoursestWithContext = ({
  initialAppState = {},
  initialProgramState = {},
  initialUserSubsidyState = {},
}) => (
  <AppContext.Provider value={initialAppState}>
    <UserSubsidyContext.Provider value={initialUserSubsidyState}>
      <ProgramContextProvider initialState={initialProgramState}>
        <ProgramCourses />
      </ProgramContextProvider>
    </UserSubsidyContext.Provider>
  </AppContext.Provider>
);
/* eslint-enable react/prop-types */

describe('<ProgramCourses />', () => {
  const initialAppState = {
    enterpriseConfig: {
      slug: 'test-enterprise-slug',
    },
  };
  const initialProgramState = {
    program: {
      title: 'Test Program Title',
      courses: [
        {
          title: 'Test Course Title',
          shortDescription: 'Test course description',
          courseRuns: [
            {
              title: 'Test Course Run Title',
              start: '2013-02-05T05:00:00Z',
              shortDescription: 'Test course description',
            },
          ],
        },
      ],
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

  test('renders program courses.', () => {
    render(
      <ProgramCoursestWithContext
        initialAppState={initialAppState}
        initialProgramState={initialProgramState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );

    expect(screen.getByText('Test Course Title')).toBeInTheDocument();
  });
});
