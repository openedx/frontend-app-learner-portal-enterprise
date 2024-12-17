import { AppContext } from '@edx/frontend-platform/react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import dayjs from 'dayjs';

import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import userEvent from '@testing-library/user-event';
import ProgramCourses, { DATE_FORMAT } from '../ProgramCourses';
import { useEnterpriseCustomer, useProgramDetails } from '../../app/data';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';
import { renderWithRouterProvider } from '../../../utils/tests';

const programUuid = '00000000-0000-0000-0000-000000000000';
const courseKey = 'edX+DemoX';
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
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
  useProgramDetails: jest.fn(),
}));

const mockAuthenticatedUser = authenticatedUserFactory();

const initialAppState = {
  authenticatedUser: mockAuthenticatedUser,
};

const ProgramCoursesWrapper = () => (
  <AppContext.Provider value={initialAppState}>
    <ProgramCourses />
  </AppContext.Provider>
);

const mockEnterpriseCustomer = enterpriseCustomerFactory();

const initialProgramState = {
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
};

describe('<ProgramCourses />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useProgramDetails.mockReturnValue({ data: initialProgramState });
  });
  test('renders program courses.', () => {
    render(
      <ProgramCoursesWrapper />,
    );

    expect(screen.getByText('Test Course Title')).toBeInTheDocument();
  });

  test('sends correct event data upon click on view the course link', () => {
    renderWithRouterProvider(
      <ProgramCoursesWrapper />,
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
    renderWithRouterProvider(
      <ProgramCoursesWrapper />,
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
    newInitialProgramState.courses[0].enterpriseHasCourse = false;
    useProgramDetails.mockReturnValue({ data: newInitialProgramState });

    render(
      <ProgramCoursesWrapper />,
    );

    expect(screen.queryByText('View the course')).not.toBeInTheDocument();
    userEvent.click(screen.getByText('Test Course Title'));
    expect(screen.getByText("This course is not included in your organization's catalog.")).toBeInTheDocument();
  });

  test('renders start date when courses are instructor led', () => {
    render(
      <ProgramCoursesWrapper />,
    );

    userEvent.click(screen.getByText('Test Course Title'));
    const courseRun = initialProgramState.courses[0].courseRuns[0];
    expect(screen.queryByText(`Starts ${dayjs(courseRun.start).format(DATE_FORMAT)}`)).toBeInTheDocument();
  });

  test('does not renders start date when courses are self paced', () => {
    const newInitialProgramState = { ...initialProgramState };
    const courseRun = newInitialProgramState.courses[0].courseRuns[0];
    courseRun.pacingType = 'self_paced';
    useProgramDetails.mockReturnValue({ data: newInitialProgramState });
    render(
      <ProgramCoursesWrapper />,
    );

    userEvent.click(screen.getByText('Test Course Title'));
    expect(screen.queryByText(`Starts ${dayjs(courseRun.start).format(DATE_FORMAT)}`)).not.toBeInTheDocument();
  });

  test('renders latest course run', () => {
    const newInitialProgramState = { ...initialProgramState };
    const firstCourseRun = newInitialProgramState.courses[0].courseRuns[0];
    const secondCourseRun = {
      title: 'Test Course Run Title',
      start: '2014-02-05T05:00:00Z',
      shortDescription: 'Test course description',
      pacingType: 'instructor_paced',
    };
    newInitialProgramState.courses[0].courseRuns.push(secondCourseRun);
    useProgramDetails.mockReturnValue({ data: newInitialProgramState });
    render(
      <ProgramCoursesWrapper />,
    );
    userEvent.click(screen.getByText('Test Course Title'));
    expect(screen.queryByText(`Starts ${dayjs(firstCourseRun.start).format(DATE_FORMAT)}`)).not.toBeInTheDocument();
    expect(screen.queryByText(`Starts ${dayjs(secondCourseRun.start).format(DATE_FORMAT)}`)).toBeInTheDocument();
  });
});
