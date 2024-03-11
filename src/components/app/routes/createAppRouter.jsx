import { PageWrap } from '@edx/frontend-platform/react';
import {
  Route, createBrowserRouter, createRoutesFromElements,
} from 'react-router-dom';

import RouteErrorBoundary from './RouteErrorBoundary';
import {
  makeCourseLoader,
  makeRootLoader,
  makeDashboardLoader, makeSearchLoader,
} from './loaders';
import Root from '../Root';
import Layout from '../Layout';
import NotFoundPage from '../../NotFoundPage';

/**
 * TODO
 * @param {Object} queryClient
 * @returns
 */
export default function createAppRouter(queryClient) {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route
        path="/"
        element={<PageWrap><Root /></PageWrap>}
        errorElement={<RouteErrorBoundary />}
      >
        <Route
          path="/:enterpriseSlug?"
          loader={makeRootLoader(queryClient)}
          element={<Layout />}
        >
          <Route
            index
            lazy={async () => {
              const { default: DashboardRoute } = await import('./DashboardRoute');
              return {
                Component: DashboardRoute,
                loader: makeDashboardLoader(queryClient),
              };
            }}
          />
          <Route
            path="search"
            lazy={async () => {
              const { default: SearchRoute } = await import('./SearchRoute');
              return {
                Component: SearchRoute,
                loader: makeSearchLoader(queryClient),
              };
            }}
          />
          <Route
            path=":courseType?/course/:courseKey/*"
            lazy={async () => {
              const { default: CourseRoute } = await import('./CourseRoute');
              return {
                Component: CourseRoute,
                loader: makeCourseLoader(queryClient),
              };
            }}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>,
    ),
  );
  return router;
}
