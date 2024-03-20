import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import dayjs from 'dayjs';
import { camelCaseObject } from '@edx/frontend-platform';
import { Factory } from 'rosie';

import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import userEvent from '@testing-library/user-event';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { ProgramContextProvider } from '../ProgramContextProvider';
import ProgramCourses, { DATE_FORMAT } from '../ProgramCourses';
import { useEnterpriseCustomer } from '../../app/data';

const programUuid = '00000000-0000-0000-0000-000000000000';
const courseKey = 'edX+DemoX';

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
  useParams: jest.fn().mockReturnValue({ programUuid }),
}));
jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
}));

const ProgramCoursesWithContext = ({
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

const mockEnterpriseCustomer = camelCaseObject(Factory.build('enterpriseCustomer'));
const mockAuthenticatedUser = camelCaseObject(Factory.build('authenticatedUser'));

const initialAppState = {
  authenticatedUser: mockAuthenticatedUser,
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

describe('<ProgramCourses />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
  });
  test('renders program courses.', () => {
    render(
      <ProgramCoursesWithContext
        initialAppState={initialAppState}
        initialProgramState={initialProgramState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );

    expect(screen.getByText('Test Course Title')).toBeInTheDocument();
  });

  test('sends correct event data upon click on view the course link', () => {
    render(
      <ProgramCoursesWithContext
        initialAppState={initialAppState}
        initialProgramState={initialProgramState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );

    userEvent.click(screen.getByText('Test Course Title'));
    userEvent.click(screen.getByRole('link', { name: 'View the course' }));
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      mockEnterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.program.course.clicked',
      { courseKey, programUuid, userId: mockAuthenticatedUser.userId },
    );
  });

  test('renders view the course link if course in catalog', () => {
    render(
      <ProgramCoursesWithContext
        initialAppState={initialAppState}
        initialProgramState={initialProgramState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );

    userEvent.click(screen.getByText('Test Course Title'));
    expect(screen.getByText('View the course')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View the course' })).toHaveAttribute(
      'href',
      `/${mockEnterpriseCustomer.slug}/course/edX+DemoX`,
    );
  });

  test('does not renders view the course link if course is not in catalog', () => {
    const newInitialProgramState = { ...initialProgramState };
    newInitialProgramState.program.courses[0].enterpriseHasCourse = false;

    render(
      <ProgramCoursesWithContext
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
      <ProgramCoursesWithContext
        initialAppState={initialAppState}
        initialProgramState={initialProgramState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );

    userEvent.click(screen.getByText('Test Course Title'));
    const courseRun = initialProgramState.program.courses[0].courseRuns[0];
    expect(screen.queryByText(`Starts ${dayjs(courseRun.start).format(DATE_FORMAT)}`)).toBeInTheDocument();
  });

  test('does not renders start date when courses are self paced', () => {
    const newInitialProgramState = { ...initialProgramState };
    const courseRun = newInitialProgramState.program.courses[0].courseRuns[0];
    courseRun.pacingType = 'self_paced';
    render(
      <ProgramCoursesWithContext
        initialAppState={initialAppState}
        initialProgramState={newInitialProgramState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );

    userEvent.click(screen.getByText('Test Course Title'));
    expect(screen.queryByText(`Starts ${dayjs(courseRun.start).format(DATE_FORMAT)}`)).not.toBeInTheDocument();
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
      <ProgramCoursesWithContext
        initialAppState={initialAppState}
        initialProgramState={newInitialProgramState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );
    userEvent.click(screen.getByText('Test Course Title'));
    expect(screen.queryByText(`Starts ${dayjs(firstCourseRun.start).format(DATE_FORMAT)}`)).not.toBeInTheDocument();
    expect(screen.queryByText(`Starts ${dayjs(secondCourseRun.start).format(DATE_FORMAT)}`)).toBeInTheDocument();
  });
});
