import React from 'react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { render } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';

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

/* eslint-disable react/prop-types */
export const FakeAppContext = ({
  initialAppState = {},
  children,
}) => (
  <AppContext.Provider value={initialAppState}>
    {children}
  </AppContext.Provider>
);
/* eslint-enable react/prop-types */

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
