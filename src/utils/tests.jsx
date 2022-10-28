import React from 'react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import moment from 'moment';
// eslint-disable-next-line import/no-extraneous-dependencies
import { render } from '@testing-library/react';

export function renderWithRouter(
  ui,
  {
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] }),
  } = {},
) {
  // eslint-disable-next-line react/prop-types
  const Wrapper = ({ children }) => <Router history={history}>{children}</Router>;
  return {
    ...render(ui, { wrapper: Wrapper }),
    // adding `history` to the returned utilities to allow us
    // to reference it in our tests (just try to avoid using
    // this to test implementation details).
    history,
  };
}

/**
 * Factory for app initial state to be used with AppContext.Provider `value`
 * e.g., <AppContext.Provider value={appInitialState()}/>
 */
export const initialAppState = ({
  enterpriseConfig = { slug: 'test-enterprise-slug' },
  config = {
    LMS_BASE_URL: process.env.LMS_BASE_URL,
  },
}) => ({
  enterpriseConfig,
  config,
});

/**
 * Factory to be used to create initial course statee used with CourseContext
 * e.g. <CourseContext.Provider />
 * Returns a self-paced course with a license subsidy, by default.
 */
export const initialCourseState = ({
  pacingType = 'self-paced',
  userSubsidyApplicableToCourse = { subsidyType: 'license' },
}) => ({
  course: {},
  activeCourseRun: {
    key: 'test-course-run-key',
    isEnrollable: true,
    pacingType,
    start: moment().subtract(1, 'w').toISOString(),
    end: moment().add(8, 'w').toISOString(),
    availability: 'Current',
    courseUuid: 'Foo',
    weeksToComplete: 4,
    enrollmentCount: 0,
  },
  userEnrollments: [],
  userEntitlements: [],
  userSubsidyApplicableToCourse,
  catalog: { catalogList: [] },
  algoliaSearchParams: {
    queryId: undefined,
    objectId: undefined,
  },
  courseRecommendations: {},
  subsidyRequestCatalogsApplicableToCourse: new Set(),
});

export const A_100_PERCENT_COUPON_CODE = {
  catalog: 'a-catalog',
  discountValue: 100,
  discountType: 'Percentage',
  couponStartDate: moment().subtract(1, 'w').toISOString(),
  couponEndDate: moment().add(8, 'w').toISOString(),
};
