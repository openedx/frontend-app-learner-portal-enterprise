import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { ProgramContextProvider } from '../ProgramContextProvider';
import ProgramSidebar from '../ProgramSidebar';
import {
  PROGRAM_TYPE_MAP, PROGRAM_PACING_MAP, PACING_TYPE_CONTENT, VERBOSE_PROGRAM_PACING_MAP,
} from '../data/constants';

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}));

/* eslint-disable react/prop-types */
const ProgramSidebarWithContext = ({
  initialAppState = {},
  initialProgramState = {},
  initialUserSubsidyState = {},
}) => (
  <AppContext.Provider value={initialAppState}>
    <UserSubsidyContext.Provider value={initialUserSubsidyState}>
      <ProgramContextProvider initialState={initialProgramState}>
        <ProgramSidebar />
      </ProgramContextProvider>
    </UserSubsidyContext.Provider>
  </AppContext.Provider>
);
/* eslint-enable react/prop-types */

describe('<ProgramSidebar />', () => {
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
          activeCourseRun: {
            pacingType: PROGRAM_PACING_MAP.SELF_PACED,
          },
        },
        {
          activeCourseRun: {
            pacingType: PROGRAM_PACING_MAP.SELF_PACED,
          },
        },
      ],
      type: PROGRAM_TYPE_MAP.MICROMASTERS,
      weeksToComplete: 3,
      minHoursEffortPerWeek: 1,
      maxHoursEffortPerWeek: 4,
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

  test('renders program sidebar', () => {
    render(
      <ProgramSidebarWithContext
        initialAppState={initialAppState}
        initialProgramState={initialProgramState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );

    const courseCount = initialProgramState.program.courses.length;
    // renders Expert Instruction content
    expect(screen.getByText('Expert instruction:')).toBeInTheDocument();
    expect(screen.getByText(`${courseCount} graduate-level courses`)).toBeInTheDocument();

    // renders pacing type and pacing type content
    const { activeCourseRun: { pacingType } } = initialProgramState.program.courses[0];
    expect(screen.getByText(`${VERBOSE_PROGRAM_PACING_MAP[pacingType]}:`)).toBeInTheDocument();
    expect(screen.getByText(PACING_TYPE_CONTENT.SELF_PACED)).toBeInTheDocument();

    // renders program duration
    const programDuration = `${initialProgramState.program.weeksToComplete} weeks`;
    expect(screen.getByText('Length:')).toBeInTheDocument();
    expect(screen.getByText(programDuration)).toBeInTheDocument();

    // renders effort per week
    const MIN_EFFORT = initialProgramState.program.minHoursEffortPerWeek;
    const MAX_EFFORT = initialProgramState.program.maxHoursEffortPerWeek;
    expect(screen.getByText('Effort:')).toBeInTheDocument();
    expect(screen.getByText(`${MIN_EFFORT} - ${MAX_EFFORT} hours per week`)).toBeInTheDocument();
  });

  test('does not render pacing type and content when active course run or pacing type is not available', () => {
    const programWithoutPacingType = {
      program: {
        title: 'Test Program Title',
        courses: [{
          title: 'test course',
        }],
      },
    };
    render(
      <ProgramSidebarWithContext
        initialAppState={initialAppState}
        initialProgramState={programWithoutPacingType}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );

    // pacing type
    expect(screen.queryByText(`${PROGRAM_PACING_MAP.SELF_PACED}:`)).not.toBeInTheDocument();
    expect(screen.queryByText(`${PROGRAM_PACING_MAP.INSTRUCTOR_PACED}:`)).not.toBeInTheDocument();
    expect(screen.queryByText(`${PROGRAM_PACING_MAP.MIXED}:`)).not.toBeInTheDocument();

    // pacing type content
    expect(screen.queryByText(PACING_TYPE_CONTENT.SELF_PACED)).not.toBeInTheDocument();
    expect(screen.queryByText(PACING_TYPE_CONTENT.INSTRUCTOR_PACED)).not.toBeInTheDocument();
  });

  test('does not render program duration when not available', () => {
    const programWithoutDuration = {
      program: {
        courses: [],
        weeksToComplete: null,
        weeksToCompleteMin: null,
        weeksToCompleteMax: null,
      },
    };
    render(
      <ProgramSidebarWithContext
        initialAppState={initialAppState}
        initialProgramState={programWithoutDuration}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );
    // label
    expect(screen.queryByText('Length:')).not.toBeInTheDocument();
    // content
    expect(screen.queryByText('week')).not.toBeInTheDocument();
    expect(screen.queryByText('weeks')).not.toBeInTheDocument();
    expect(screen.queryByText('month')).not.toBeInTheDocument();
    expect(screen.queryByText('months')).not.toBeInTheDocument();
    expect(screen.queryByText('year')).not.toBeInTheDocument();
    expect(screen.queryByText('years')).not.toBeInTheDocument();
  });

  test('does not render effort per week when both min and max effort or one of them is not available', () => {
    let programWithoutEffortPerWeek = {
      program: {
        courses: [],
      },
    };
    render(
      <ProgramSidebarWithContext
        initialAppState={initialAppState}
        initialProgramState={programWithoutEffortPerWeek}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );
    // label
    expect(screen.queryByText('Effort:')).not.toBeInTheDocument();
    // content
    expect(screen.queryByText('hours per week')).not.toBeInTheDocument();

    // when max effort is not available
    programWithoutEffortPerWeek = {
      program: {
        courses: [],
      },
      minHoursEffortPerWeek: 1,
    };
    render(
      <ProgramSidebarWithContext
        initialAppState={initialAppState}
        initialProgramState={programWithoutEffortPerWeek}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );
    // label
    expect(screen.queryByText('Effort:')).not.toBeInTheDocument();
    // content
    expect(screen.queryByText('hours per week')).not.toBeInTheDocument();
  });
});
