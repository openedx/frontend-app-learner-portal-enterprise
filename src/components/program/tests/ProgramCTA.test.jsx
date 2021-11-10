import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from 'react-intl';

import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { ProgramContextProvider } from '../ProgramContextProvider';
import ProgramCTA from '../ProgramCTA';

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}));

/* eslint-disable react/prop-types */
const ProgramCTAtWithContext = ({
  initialAppState = {},
  initialProgramState = {},
  initialUserSubsidyState = {},
}) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={initialAppState}>
      <UserSubsidyContext.Provider value={initialUserSubsidyState}>
        <ProgramContextProvider initialState={initialProgramState}>
          <ProgramCTA />
        </ProgramContextProvider>
      </UserSubsidyContext.Provider>
    </AppContext.Provider>
  </IntlProvider>
);
/* eslint-enable react/prop-types */

describe('<ProgramCTA />', () => {
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

  test('renders program CTA.', () => {
    render(
      <ProgramCTAtWithContext
        initialAppState={initialAppState}
        initialProgramState={initialProgramState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );

    expect(screen.getByText('2 courses included in your enterprise catalog')).toBeInTheDocument();
  });

  test('renders program CTA with no courses available.', () => {
    initialProgramState.program.courses = [{
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
    }];
    render(
      <ProgramCTAtWithContext
        initialAppState={initialAppState}
        initialProgramState={initialProgramState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );

    expect(screen.getByText('These courses are not included in your enterprise catalog')).toBeInTheDocument();
  });

  test('renders program CTA with all courses available.', () => {
    initialProgramState.program.courses = [{
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
    }];
    render(
      <ProgramCTAtWithContext
        initialAppState={initialAppState}
        initialProgramState={initialProgramState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
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
    initialProgramState.program.courses = [{
      key: 'edX+DemoX',
      title: 'Test Course 1 Title',
      shortDescription: 'Test course 1 description',
      activeCourseRun: courseRun,
      courseRuns: [courseRun],
      enterpriseHasCourse: true,
    }];
    render(
      <ProgramCTAtWithContext
        initialAppState={initialAppState}
        initialProgramState={initialProgramState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
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
    initialProgramState.program.courses = [
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
    ];
    render(
      <ProgramCTAtWithContext
        initialAppState={initialAppState}
        initialProgramState={initialProgramState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
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
    initialProgramState.program.courses = [
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
    ];
    render(
      <ProgramCTAtWithContext
        initialAppState={initialAppState}
        initialProgramState={initialProgramState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
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
    initialProgramState.program.courses = [
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
    ];
    render(
      <ProgramCTAtWithContext
        initialAppState={initialAppState}
        initialProgramState={initialProgramState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
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
    initialProgramState.program.courses = [
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
    ];
    render(
      <ProgramCTAtWithContext
        initialAppState={initialAppState}
        initialProgramState={initialProgramState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );

    expect(screen.getByText('2 courses in 2 years 6 months')).toBeInTheDocument();
  });
});
