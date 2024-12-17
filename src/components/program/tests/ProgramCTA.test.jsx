import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { screen, render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import userEvent from '@testing-library/user-event';
import ProgramCTA from '../ProgramCTA';
import { useEnterpriseCustomer, useProgramDetails } from '../../app/data';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';

const courseKey = 'edX+DemoX';
const programUuid = '00000000-0000-0000-0000-000000000000';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn().mockReturnValue({ programUuid }),
}));
jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useProgramDetails: jest.fn(),
}));

const mockAuthenticatedUser = authenticatedUserFactory();

const initialAppState = {
  authenticatedUser: mockAuthenticatedUser,
};

const ProgramCTAtWithContext = () => (
  <IntlProvider locale="en">
    <AppContext.Provider value={initialAppState}>
      <ProgramCTA />
    </AppContext.Provider>
  </IntlProvider>
);

const mockEnterpriseCustomer = enterpriseCustomerFactory();

const initialProgramState = {
  title: 'Test Program Title',
  courses: [
    {
      key: 'edX+DemoX',
      title: 'Test Course 1 Title',
      shortDescription: 'Test course 1 description',
      courseRuns: [
        {
          title: 'Test Course Run 1 Title',
          start: '2013-02-05T05:00:00Z',
          shortDescription: 'Test course 1 description',
        },
      ],
      enterpriseHasCourse: true,
    },
    {
      key: 'edX+DemoX',
      title: 'Test Course 2 Title',
      shortDescription: 'Test course 2 description',
      courseRuns: [
        {
          title: 'Test Course Run 2 Title',
          start: '2013-02-05T05:00:00Z',
          shortDescription: 'Test course 2 description',
        },
      ],
      enterpriseHasCourse: false,
    },
    {
      key: 'edX+DemoX',
      title: 'Test Course 3 Title',
      shortDescription: 'Test course 3 description',
      courseRuns: [
        {
          title: 'Test Course Run 3 Title',
          start: '2013-02-05T05:00:00Z',
          shortDescription: 'Test course 3 description',
        },
      ],
      enterpriseHasCourse: true,
    },
  ],
};

describe('<ProgramCTA />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useProgramDetails.mockReturnValue({ data: initialProgramState });
  });
  test('renders program CTA.', () => {
    render(
      <ProgramCTAtWithContext />,
    );

    expect(screen.getByText('2 courses included in your enterprise catalog')).toBeInTheDocument();
    expect(screen.getByText('View Course Details')).toBeInTheDocument();
    userEvent.click(screen.getByText('View Course Details'));
    fireEvent.click(screen.getByText('Test Course 1 Title'));
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      mockEnterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.program.cta.course.clicked',
      { courseKey, programUuid, userId: mockAuthenticatedUser.userId },
    );
  });

  test('renders program CTA with no courses available.', () => {
    const updatedProgramState = {
      ...initialProgramState,
      courses: [{
        key: 'edX+DemoX',
        title: 'Test Course 1 Title',
        shortDescription: 'Test course 1 description',
        courseRuns: [
          {
            title: 'Test Course Run 1 Title',
            start: '2013-02-05T05:00:00Z',
            shortDescription: 'Test course 1 description',
          },
        ],
        enterpriseHasCourse: false,
      }],
    };
    useProgramDetails.mockReturnValue({ data: updatedProgramState });
    render(
      <ProgramCTAtWithContext />,
    );

    expect(screen.getByText('These courses are not included in your enterprise catalog')).toBeInTheDocument();
  });

  test('renders program CTA with all courses available.', () => {
    const updatedProgramState = {
      ...initialProgramState,
      courses: [{
        key: 'edX+DemoX',
        title: 'Test Course 1 Title',
        shortDescription: 'Test course 1 description',
        courseRuns: [
          {
            title: 'Test Course Run 1 Title',
            start: '2013-02-05T05:00:00Z',
            shortDescription: 'Test course 1 description',
          },
        ],
        enterpriseHasCourse: true,
      }],
    };
    useProgramDetails.mockReturnValue({ data: updatedProgramState });
    render(
      <ProgramCTAtWithContext />,
    );

    expect(screen.getByText('All courses included in your enterprise catalog')).toBeInTheDocument();
  });

  test('renders program CTA 1 month course duration.', () => {
    const courseRun = {
      title: 'Test Course Run 1 Title',
      start: '2013-02-05T05:00:00Z',
      shortDescription: 'Test course 1 description',
      weeksToComplete: 4,
    };
    const updatedProgramState = {
      ...initialProgramState,
      courses: [{
        key: 'edX+DemoX',
        title: 'Test Course 1 Title',
        shortDescription: 'Test course 1 description',
        activeCourseRun: courseRun,
        courseRuns: [courseRun],
        enterpriseHasCourse: true,
      }],
      weeksToComplete: 4,
    };
    useProgramDetails.mockReturnValue({ data: updatedProgramState });
    render(
      <ProgramCTAtWithContext />,
    );

    expect(screen.getByText('1 course in 1 month')).toBeInTheDocument();
  });

  test('renders program CTA 1 year course duration.', () => {
    const courseRun = {
      title: 'Test Course Run 1 Title',
      start: '2013-02-05T05:00:00Z',
      shortDescription: 'Test course 1 description',
      weeksToComplete: 24,
    };
    const updatedProgramState = {
      ...initialProgramState,
      courses: [
        {
          key: 'edX+DemoX',
          title: 'Test Course 1 Title',
          shortDescription: 'Test course 1 description',
          activeCourseRun: courseRun,
          courseRuns: [courseRun],
          enterpriseHasCourse: true,
        },
        {
          key: 'edX+DemoX',
          title: 'Test Course 1 Title',
          shortDescription: 'Test course 1 description',
          activeCourseRun: courseRun,
          courseRuns: [courseRun],
          enterpriseHasCourse: true,
        },
      ],
      weeksToComplete: 48,
    };
    useProgramDetails.mockReturnValue({ data: updatedProgramState });
    render(
      <ProgramCTAtWithContext />,
    );

    expect(screen.getByText('2 courses in 1 year')).toBeInTheDocument();
  });

  test('renders program CTA 1 year and 1 month course duration.', () => {
    const courseRun = {
      title: 'Test Course Run 1 Title',
      start: '2013-02-05T05:00:00Z',
      shortDescription: 'Test course 1 description',
      weeksToComplete: 26,
    };
    const updatedProgramState = {
      ...initialProgramState,
      courses: [
        {
          key: 'edX+DemoX',
          title: 'Test Course 1 Title',
          shortDescription: 'Test course 1 description',
          activeCourseRun: courseRun,
          courseRuns: [courseRun],
          enterpriseHasCourse: true,
        },
        {
          key: 'edX+DemoX',
          title: 'Test Course 1 Title',
          shortDescription: 'Test course 1 description',
          activeCourseRun: courseRun,
          courseRuns: [courseRun],
          enterpriseHasCourse: true,
        },
      ],
      weeksToComplete: 52,
    };
    useProgramDetails.mockReturnValue({ data: updatedProgramState });
    render(
      <ProgramCTAtWithContext />,
    );

    expect(screen.getByText('2 courses in 1 year 1 month')).toBeInTheDocument();
  });

  test('renders program CTA 2 years and 1 month course duration.', () => {
    const courseRun = {
      title: 'Test Course Run 1 Title',
      start: '2013-02-05T05:00:00Z',
      shortDescription: 'Test course 1 description',
      weeksToComplete: 50,
    };
    const updatedProgramState = {
      ...initialProgramState,
      courses: [
        {
          key: 'edX+DemoX',
          title: 'Test Course 1 Title',
          shortDescription: 'Test course 1 description',
          activeCourseRun: courseRun,
          courseRuns: [courseRun],
          enterpriseHasCourse: true,
        },
        {
          key: 'edX+DemoX',
          title: 'Test Course 1 Title',
          shortDescription: 'Test course 1 description',
          activeCourseRun: courseRun,
          courseRuns: [courseRun],
          enterpriseHasCourse: true,
        },
      ],
      weeksToComplete: 100,
    };
    useProgramDetails.mockReturnValue({ data: updatedProgramState });
    render(
      <ProgramCTAtWithContext />,
    );

    expect(screen.getByText('2 courses in 2 years 1 month')).toBeInTheDocument();
  });

  test('renders program CTA 2 years and 4 months course duration.', () => {
    const courseRun = {
      title: 'Test Course Run 1 Title',
      start: '2013-02-05T05:00:00Z',
      shortDescription: 'Test course 1 description',
      weeksToComplete: 59,
    };
    const updatedProgramState = {
      ...initialProgramState,
      courses: [
        {
          key: 'edX+DemoX',
          title: 'Test Course 1 Title',
          shortDescription: 'Test course 1 description',
          activeCourseRun: courseRun,
          courseRuns: [courseRun],
          enterpriseHasCourse: true,
        },
        {
          key: 'edX+DemoX',
          title: 'Test Course 1 Title',
          shortDescription: 'Test course 1 description',
          activeCourseRun: courseRun,
          courseRuns: [courseRun],
          enterpriseHasCourse: true,
        },
      ],
      weeksToComplete: 118,
    };
    useProgramDetails.mockReturnValue({ data: updatedProgramState });
    render(
      <ProgramCTAtWithContext />,
    );

    expect(screen.getByText('2 courses in 2 years 6 months')).toBeInTheDocument();
  });

  test('renders program CTA 2 years and 4 months course duration.', () => {
    const courseRun = {
      title: 'Test Course Run 1 Title',
      start: '2013-02-05T05:00:00Z',
      shortDescription: 'Test course 1 description',
      weeksToComplete: 59,
    };
    const updatedProgramState = {
      ...initialProgramState,
      courses: [
        {
          key: 'edX+DemoX',
          title: 'Test Course 1 Title',
          shortDescription: 'Test course 1 description',
          activeCourseRun: courseRun,
          courseRuns: [courseRun],
          enterpriseHasCourse: true,
        },
        {
          key: 'edX+DemoX',
          title: 'Test Course 1 Title',
          shortDescription: 'Test course 1 description',
          activeCourseRun: courseRun,
          courseRuns: [courseRun],
          enterpriseHasCourse: true,
        },
      ],
      weeksToComplete: null,
    };
    useProgramDetails.mockReturnValue({ data: updatedProgramState });
    render(
      <ProgramCTAtWithContext />,
    );

    expect(screen.getByText('2 courses in 2 years 6 months')).toBeInTheDocument();
  });
});
