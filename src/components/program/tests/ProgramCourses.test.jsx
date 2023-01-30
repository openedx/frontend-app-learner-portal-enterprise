import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import moment from 'moment';

import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import userEvent from '@testing-library/user-event';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { ProgramContextProvider } from '../ProgramContextProvider';
import ProgramCourses, { DATE_FORMAT } from '../ProgramCourses';

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
jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

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
              pacingType: 'instructor_paced',
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
    couponCodes: {
      couponCodes: [],
      couponCodesCount: 0,
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

    userEvent.click(screen.getByText('Test Course Title'));
    userEvent.click(screen.getByRole('link', { name: 'View the course' }));
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

    userEvent.click(screen.getByText('Test Course Title'));
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
    userEvent.click(screen.getByText('Test Course Title'));
    expect(screen.getByText("This course is not included in your organization's catalog.")).toBeInTheDocument();
  });

  test('renders start date when courses are instructor led', () => {
    render(
      <ProgramCoursestWithContext
        initialAppState={initialAppState}
        initialProgramState={initialProgramState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );

    userEvent.click(screen.getByText('Test Course Title'));
    const courseRun = initialProgramState.program.courses[0].courseRuns[0];
    expect(screen.queryByText(`Starts ${moment(courseRun.start).format(DATE_FORMAT)}`)).toBeInTheDocument();
  });

  test('does not renders start date when courses are self paced', () => {
    const newInitialProgramState = { ...initialProgramState };
    const courseRun = newInitialProgramState.program.courses[0].courseRuns[0];
    courseRun.pacingType = 'self_paced';
    render(
      <ProgramCoursestWithContext
        initialAppState={initialAppState}
        initialProgramState={newInitialProgramState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );

    userEvent.click(screen.getByText('Test Course Title'));
    expect(screen.queryByText(`Starts ${moment(courseRun.start).format(DATE_FORMAT)}`)).not.toBeInTheDocument();
  });

  test('renders latest course run', () => {
    const newInitialProgramState = { ...initialProgramState };
    const firstCourseRun = newInitialProgramState.program.courses[0].courseRuns[0];
    const secondCourseRun = {
      title: 'Test Course Run Title',
      start: '2014-02-05T05:00:00Z',
      shortDescription: 'Test course description',
      pacingType: 'instructor_paced',
    };
    newInitialProgramState.program.courses[0].courseRuns.push(secondCourseRun);
    render(
      <ProgramCoursestWithContext
        initialAppState={initialAppState}
        initialProgramState={newInitialProgramState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );
    userEvent.click(screen.getByText('Test Course Title'));
    expect(screen.queryByText(`Starts ${moment(firstCourseRun.start).format(DATE_FORMAT)}`)).not.toBeInTheDocument();
    expect(screen.queryByText(`Starts ${moment(secondCourseRun.start).format(DATE_FORMAT)}`)).toBeInTheDocument();
  });
});
