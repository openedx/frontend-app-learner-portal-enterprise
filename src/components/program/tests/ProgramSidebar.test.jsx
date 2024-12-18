import { AppContext } from '@edx/frontend-platform/react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import ProgramSidebar from '../ProgramSidebar';
import {
  PROGRAM_TYPE_MAP, PROGRAM_PACING_MAP, PACING_TYPE_CONTENT, VERBOSE_PROGRAM_PACING_MAP,
} from '../data/constants';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';
import { useEnterpriseCustomer, useProgramDetails } from '../../app/data';

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useProgramDetails: jest.fn(),
}));

const mockAuthenticatedUser = authenticatedUserFactory();

const initialAppState = {
  authenticatedUser: mockAuthenticatedUser,
};

const ProgramSidebarWrapper = () => (
  <AppContext.Provider value={initialAppState}>
    <ProgramSidebar />
  </AppContext.Provider>
);

const initialProgramState = {
  title: 'Test Program Title',
  courses: [
    {
      activeCourseRun: {
        pacingType: PROGRAM_PACING_MAP.SELF_PACED,
        weeksToComplete: 1,
      },
    },
    {
      activeCourseRun: {
        pacingType: PROGRAM_PACING_MAP.SELF_PACED,
        weeksToComplete: 1,
      },
    },
  ],
  type: PROGRAM_TYPE_MAP.MICROMASTERS,
  weeksToComplete: 3,
  minHoursEffortPerWeek: 1,
  maxHoursEffortPerWeek: 4,
};

const mockEnterpriseCustomer = enterpriseCustomerFactory();

describe('<ProgramSidebar />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useProgramDetails.mockReturnValue({ data: initialProgramState });
  });
  test('renders program sidebar', () => {
    render(
      <ProgramSidebarWrapper />,
    );

    const courseCount = initialProgramState.courses.length;
    // renders Expert Instruction content
    expect(screen.getByText('Expert instruction:')).toBeInTheDocument();
    expect(screen.getByText(`${courseCount} graduate-level courses`)).toBeInTheDocument();

    // renders pacing type and pacing type content
    const { activeCourseRun: { pacingType } } = initialProgramState.courses[0];
    expect(screen.getByText(`${VERBOSE_PROGRAM_PACING_MAP[pacingType]}:`)).toBeInTheDocument();
    expect(screen.getByText(PACING_TYPE_CONTENT.SELF_PACED)).toBeInTheDocument();

    // renders program duration
    const programDuration = '2 weeks';
    expect(screen.getByText('Length:')).toBeInTheDocument();
    expect(screen.getByText(programDuration)).toBeInTheDocument();

    // renders effort per week
    const MIN_EFFORT = initialProgramState.minHoursEffortPerWeek;
    const MAX_EFFORT = initialProgramState.maxHoursEffortPerWeek;
    expect(screen.getByText('Effort:')).toBeInTheDocument();
    expect(screen.getByText(`${MIN_EFFORT} - ${MAX_EFFORT} hours per week`)).toBeInTheDocument();
  });

  test('does not render pacing type and content when active course run or pacing type is not available', () => {
    const programWithoutPacingType = {
      title: 'Test Program Title',
      courses: [{
        title: 'test course',
      }],
    };
    useProgramDetails.mockReturnValue({ data: programWithoutPacingType });
    render(
      <ProgramSidebarWrapper />,
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
      courses: [],
      weeksToComplete: null,
      weeksToCompleteMin: null,
      weeksToCompleteMax: null,
    };
    useProgramDetails.mockReturnValue({ data: programWithoutDuration });
    render(
      <ProgramSidebarWrapper />,
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
      courses: [],
    };
    useProgramDetails.mockReturnValue({ data: programWithoutEffortPerWeek });
    render(
      <ProgramSidebarWrapper />,
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
      <ProgramSidebarWrapper />,
    );
    // label
    expect(screen.queryByText('Effort:')).not.toBeInTheDocument();
    // content
    expect(screen.queryByText('hours per week')).not.toBeInTheDocument();
  });
});
