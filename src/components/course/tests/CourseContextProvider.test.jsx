import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { CourseContextProvider, CourseContext } from '../CourseContextProvider';

const baseInitialCourseState = {
  course: {},
  activeCourseRun: {},
  userEnrollments: [],
  userEntitlements: [],
  courseRecommendations: {},
  catalog: { catalogList: [] },
};

const CourseContextProviderWrapper = ({
  subsidyRequestCatalogsApplicableToCourse = new Set(),
  userCanRequestSubsidyForCourse = false,
  initialCourseState = baseInitialCourseState,
  children,
}) => (
  <CourseContextProvider
    initialCourseState={initialCourseState}
    subsidyRequestCatalogsApplicableToCourse={subsidyRequestCatalogsApplicableToCourse}
    userCanRequestSubsidyForCourse={userCanRequestSubsidyForCourse}
  >
    {children}
  </CourseContextProvider>
);

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

  test.each([
    { canRequestEnrollment: true },
    { canRequestEnrollment: false },
  ])('has 1 catalog for configured subsidy type applicable to course', ({ canRequestEnrollment }) => {
    const testCatalogUUID = 'test-catalog-uuid';
    const courseState = {
      ...baseInitialCourseState,
      catalog: { catalogList: [testCatalogUUID] },
    };
    const requestCatalogsForCourse = canRequestEnrollment ? [testCatalogUUID] : [];
    render(
      <CourseContextProviderWrapper
        subsidyRequestCatalogsApplicableToCourse={new Set(requestCatalogsForCourse)}
        initialCourseState={courseState}
        userCanRequestSubsidyForCourse={canRequestEnrollment}
      >
        <CourseContext.Consumer>
          {({ subsidyRequestCatalogsApplicableToCourse, userCanRequestSubsidyForCourse }) => (
            <>
              <p>Count: {subsidyRequestCatalogsApplicableToCourse.size}</p>
              <p>Can request enrollment: {userCanRequestSubsidyForCourse ? 'true' : 'false'}</p>
            </>
          )}
        </CourseContext.Consumer>
      </CourseContextProviderWrapper>,
    );

    if (canRequestEnrollment) {
      expect(screen.getByText('Count: 1'));
      expect(screen.getByText('Can request enrollment: true'));
    } else {
      expect(screen.getByText('Count: 0'));
      expect(screen.getByText('Can request enrollment: false'));
    }
  });
});
