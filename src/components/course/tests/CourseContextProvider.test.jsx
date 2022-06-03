import PropTypes from 'prop-types';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { SubsidyRequestsContext } from '../../enterprise-subsidy-requests';
import { CourseContextProvider, CourseContext } from '../CourseContextProvider';

const baseSubsidyRequestContextValue = {
  catalogsForSubsidyRequests: [],
};

const baseInitialCourseState = {
  course: {},
  activeCourseRun: {},
  userEnrollments: [],
  userEntitlements: [],
  courseRecommendations: {},
  catalog: { catalogList: [] },
};

const CourseContextProviderWrapper = ({
  subsidyRequestsContextValue,
  initialCourseState,
  children,
}) => (
  <SubsidyRequestsContext.Provider value={subsidyRequestsContextValue}>
    <CourseContextProvider initialState={initialCourseState}>
      {children}
    </CourseContextProvider>
  </SubsidyRequestsContext.Provider>
);

CourseContextProviderWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  subsidyRequestsContextValue: PropTypes.shape(),
  initialCourseState: PropTypes.shape(),
};

CourseContextProviderWrapper.defaultProps = {
  subsidyRequestsContextValue: baseSubsidyRequestContextValue,
  initialCourseState: baseInitialCourseState,
};

describe('<CourseContextProvider>', () => {
  test('has 0 subsidy request catalogs applicable to course', () => {
    render(
      <CourseContextProviderWrapper>
        <CourseContext.Consumer>
          {({ subsidyRequestCatalogsApplicableToCourse }) => (
            <p>Count: {subsidyRequestCatalogsApplicableToCourse.size}</p>
          )}
        </CourseContext.Consumer>
      </CourseContextProviderWrapper>,
    );
    expect(screen.getByText('Count: 0'));
  });

  test('has 1 catalog for configured subsidy type applicable to course', () => {
    const testCatalogUUID = 'test-catalog-uuid';
    const courseState = {
      ...baseInitialCourseState,
      catalog: { catalogList: [testCatalogUUID] },
    };
    const subsidyRequestContextValue = {
      ...baseSubsidyRequestContextValue,
      catalogsForSubsidyRequests: [testCatalogUUID],
    };
    render(
      <CourseContextProviderWrapper
        subsidyRequestsContextValue={subsidyRequestContextValue}
        initialCourseState={courseState}
      >
        <CourseContext.Consumer>
          {({ subsidyRequestCatalogsApplicableToCourse }) => (
            <p>Count: {subsidyRequestCatalogsApplicableToCourse.size}</p>
          )}
        </CourseContext.Consumer>
      </CourseContextProviderWrapper>,
    );
    expect(screen.getByText('Count: 1'));
  });
});
