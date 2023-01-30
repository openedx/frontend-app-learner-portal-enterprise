import React from 'react';
import PropTypes from 'prop-types';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { AppContext } from '@edx/frontend-platform/react';
import userEvent from '@testing-library/user-event';
import { initialAppState } from '../../../utils/tests';
import { CourseContextProvider } from '../CourseContextProvider';
import CourseAssociatedPrograms from '../CourseAssociatedPrograms';
import { SubsidyRequestsContext } from '../../enterprise-subsidy-requests';

jest.mock('@edx/frontend-enterprise-utils', () => ({
  sendEnterpriseTrackEvent: jest.fn(),
  hasFeatureFlagEnabled: jest.fn(),
}));

const baseSubsidyRequestContextValue = {
  catalogsForSubsidyRequests: [],
};

const INITIAL_APP_STATE = initialAppState({});

const CourseAssociatedProgramsWithCourseContext = ({
  initialState,
  subsidyRequestContextValue,
}) => (
  <AppContext.Provider value={INITIAL_APP_STATE}>
    <SubsidyRequestsContext.Provider value={subsidyRequestContextValue}>
      <CourseContextProvider initialState={initialState}>
        <CourseAssociatedPrograms />
      </CourseContextProvider>
    </SubsidyRequestsContext.Provider>
  </AppContext.Provider>
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
    initialState.course.programs.forEach((program, index) => {
      expect(screen.queryByText(program.title)).toBeInTheDocument();
      const button = screen.getByText(program.title);
      userEvent.click(button);
      expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(index + 1);
    });
  });
});
