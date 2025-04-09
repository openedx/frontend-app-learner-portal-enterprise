import { isValidElement } from 'react';
import { BrowserRouter as Router, createMemoryRouter, RouterProvider } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import dayjs from 'dayjs';
import { render } from '@testing-library/react'; // eslint-disable-line import/no-extraneous-dependencies
import { QueryCache, QueryClient } from '@tanstack/react-query';
import { queryCacheOnErrorHandler } from './common';

/**
 * TODO
 * @param {*} children
 * @param {*} options
 * @returns
 */
export function renderWithRouterProvider(
  children,
  {
    routes = [],
    initialEntries,
    customRouter,
  } = {},
) {
  const options = isValidElement(children)
    ? { element: children, path: '/' }
    : children;

  const router = customRouter ?? createMemoryRouter([{ ...options }, ...routes], {
    initialEntries: ['/', ...(initialEntries ?? [options.path])],
    initialIndex: 1,
  });

  return render(<RouterProvider router={router} />);
}

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

/**
 * Factory for app initial state to be used with AppContext.Provider `value`
 * e.g., <AppContext.Provider value={appInitialState()}/>
 */
export const initialAppState = ({
  config = {
    LMS_BASE_URL: process.env.LMS_BASE_URL,
  },
} = {}) => ({
  config,
});

/**
 * Factory to be used to create initial course state used with CourseContext
 * e.g. <CourseContext.Provider />
 * Returns a self-paced course with a license subsidy, by default.
 */
export const mockCourseState = ({
  pacingType = 'self-paced',
  userSubsidyApplicableToCourse = { subsidyType: 'license' },
}) => ({
  course: {},
  activeCourseRun: {
    key: 'test-course-run-key',
    isEnrollable: true,
    pacingType,
    start: dayjs().subtract(1, 'w').toISOString(),
    end: dayjs().add(8, 'w').toISOString(),
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
  couponStartDate: dayjs().subtract(1, 'w').toISOString(),
  couponEndDate: dayjs().add(8, 'w').toISOString(),
};

export function queryClient(defaultOptions = {}) {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: queryCacheOnErrorHandler,
    }),
    defaultOptions: {
      ...defaultOptions,
      queries: {
        retry: false,
        ...defaultOptions.queries,
      },
    },
  });
}

/**
 * Generates all possible permutations of an object where each key has multiple possible values.
 *
 * @param {Object.<string, any[]>} options - An object where each key has an array of possible values.
 * @returns {Object[]} - An array of objects containing all possible combinations of the input values.
 *
 * @example
 * const input = {
 *   shouldUpdateActiveEnterpriseCustomerUser: [true, false],
 *   isBFFData: [true, false],
 *   anotherFlag: ["A", "B"]
 * };
 *
 * const result = generatePermutations(input);
 *
 * // Output:
 * // [
 * //   { shouldUpdateActiveEnterpriseCustomerUser: true, isBFFData: true, anotherFlag: "A" },
 * //   { shouldUpdateActiveEnterpriseCustomerUser: true, isBFFData: true, anotherFlag: "B" },
 * //   { shouldUpdateActiveEnterpriseCustomerUser: true, isBFFData: false, anotherFlag: "A" },
 * //   { shouldUpdateActiveEnterpriseCustomerUser: true, isBFFData: false, anotherFlag: "B" },
 * //   { shouldUpdateActiveEnterpriseCustomerUser: false, isBFFData: true, anotherFlag: "A" },
 * //   { shouldUpdateActiveEnterpriseCustomerUser: false, isBFFData: true, anotherFlag: "B" },
 * //   { shouldUpdateActiveEnterpriseCustomerUser: false, isBFFData: false, anotherFlag: "A" },
 * //   { shouldUpdateActiveEnterpriseCustomerUser: false, isBFFData: false, anotherFlag: "B" }
 * // ]
 */
export const generateTestPermutations = (options) => Object.entries(options).reduce(
  (acc, [key, values]) => acc.flatMap(prev => values.map(value => ({ ...prev, [key]: value }))),
  [{}],
);
