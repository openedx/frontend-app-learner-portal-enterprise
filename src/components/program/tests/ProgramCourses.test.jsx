import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { screen, render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { ProgramContextProvider } from '../ProgramContextProvider';
import ProgramCourses from '../ProgramCourses';

const programUuid = '00000000-0000-0000-0000-000000000000';
const enterpriseUuid = '11111111-1111-1111-1111-111111111111';
const userId = 'batman';
const courseKey = 'edX+DemoX';

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
  useParams: jest.fn().mockReturnValue({ programUuid }),
}));
jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedUser: () => ({ userId }),
}));
jest.mock('@edx/frontend-enterprise-utils', () => ({
  sendEnterpriseTrackEvent: jest.fn(),
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
      uuid: enterpriseUuid,
    },
  };
  const initialProgramState = {
    program: {
      title: 'Test Program Title',
      courses: [
        {
          key: courseKey,
          title: 'Test Course Title',
          shortDescription: 'Test course description',
          courseRuns: [
            {
              title: 'Test Course Run Title',
              start: '2013-02-05T05:00:00Z',
              shortDescription: 'Test course description',
            },
          ],
          enterpriseHasCourse: true,
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

  test('sends correct event data upon click on view the course link', () => {
    render(
      <ProgramCoursestWithContext
        initialAppState={initialAppState}
        initialProgramState={initialProgramState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );

    fireEvent.click(screen.getByText('Test Course Title'));
    fireEvent.click(screen.getByRole('link', { name: 'View the course' }));
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      enterpriseUuid,
      'edx.ui.enterprise.learner_portal.program.course.clicked',
      { courseKey, programUuid, userId },
    );
  });

  test('renders view the course link if course in catalog', () => {
    render(
      <ProgramCoursestWithContext
        initialAppState={initialAppState}
        initialProgramState={initialProgramState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );

    fireEvent.click(screen.getByText('Test Course Title'));
    expect(screen.getByText('View the course')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View the course' })).toHaveAttribute('href', '/test-enterprise-slug/course/edX+DemoX');
  });

  test('does not renders view the course link if course is not in catalog', () => {
    const newInitialProgramState = { ...initialProgramState };
    newInitialProgramState.program.courses[0].enterpriseHasCourse = false;

    render(
      <ProgramCoursestWithContext
        initialAppState={initialAppState}
        initialProgramState={newInitialProgramState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );

    expect(screen.queryByText('View the course')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Test Course Title'));
    expect(screen.getByText("This course is not included in your organization's catalog.")).toBeInTheDocument();
  });
});
