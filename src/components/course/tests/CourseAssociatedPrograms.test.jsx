import React from 'react';
import PropTypes from 'prop-types';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { CourseContextProvider } from '../CourseContextProvider';
import CourseAssociatedPrograms from '../CourseAssociatedPrograms';
import { SubsidyRequestsContext } from '../../enterprise-subsidy-requests';

const baseSubsidyRequestContextValue = {
  catalogsForSubsidyRequests: [],
};

const CourseAssociatedProgramsWithCourseContext = ({
  initialState,
  subsidyRequestContextValue,
}) => (
  <SubsidyRequestsContext.Provider value={subsidyRequestContextValue}>
    <CourseContextProvider initialState={initialState}>
      <CourseAssociatedPrograms />
    </CourseContextProvider>
  </SubsidyRequestsContext.Provider>
);

CourseAssociatedProgramsWithCourseContext.propTypes = {
  initialState: PropTypes.shape(),
  subsidyRequestContextValue: PropTypes.shape(),
};

CourseAssociatedProgramsWithCourseContext.defaultProps = {
  initialState: {},
  subsidyRequestContextValue: baseSubsidyRequestContextValue,
};

describe('<CourseAssociatedPrograms />', () => {
  const initialState = {
    course: {
      programs: [
        {
          uuid: '123', type: 'abc', title: 'title a', marketingUrl: 'www.example.com',
        },
        {
          uuid: '456', type: 'def', title: 'title b', marketingUrl: 'www.example.com',
        },
      ],
    },
    activeCourseRun: {},
    userEnrollments: [],
    userEntitlements: [],
    catalog: {},
    courseRecommendations: {},
  };

  test('renders programs with title', () => {
    render(<CourseAssociatedProgramsWithCourseContext initialState={initialState} />);
    initialState.course.programs.forEach((program) => {
      expect(screen.queryByText(program.title)).toBeInTheDocument();
    });
  });
});
