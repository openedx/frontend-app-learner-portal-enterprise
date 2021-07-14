import React from 'react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import moment from 'moment';
import { render } from '@testing-library/react';

// eslint-disable import/prefer-default-export
export function renderWithRouter(
  ui,
  {
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] }),
  } = {},
) {
  // eslint-disable-next-line react/prop-types
  const Wrapper = ({ children }) => (
    <Router history={history}>{children}</Router>
  );
  return {
    ...render(ui, { wrapper: Wrapper }),
    // adding `history` to the returned utilities to allow us
    // to reference it in our tests (just try to avoid using
    // this to test implementation details).
    history,
  };
}

/* warning, this store may not be complete, please add to it as needed */
export const fakeReduxStore = {
  courseEnrollments: {
    courseRuns: [],
    error: null,
    isMarkCourseCompleteSuccess: false,
    isMoveToInProgressSuccess: false,
  },
  offers: {
    loading: false,
    offersCount: 0,
    offers: [],
  },
};

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
  },
  userEnrollments: [],
  userEntitlements: [],
  userSubsidyApplicableToCourse,
  catalog: { catalogList: [] },
  algoliaSearchParams: {
    queryId: undefined,
    objectId: undefined,
  },
});

export const A_100_PERCENT_OFFER = {
  catalog: 'a-catalog', discountValue: 100, discountType: 'Percentage',
};
