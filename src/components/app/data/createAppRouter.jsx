import { PageWrap } from '@edx/frontend-platform/react';
import {
  Route, createBrowserRouter, createRoutesFromElements,
} from 'react-router-dom';

import RouteErrorBoundary from '../routes/RouteErrorBoundary';
import {
  makeCourseLoader,
  makeRootLoader,
  makeDashboardLoader,
} from '../routes/loaders';
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
              const { DashboardRoute } = await import('../routes');
              return {
                Component: DashboardRoute,
                loader: makeDashboardLoader(queryClient),
              };
            }}
          />
          <Route
            path="search"
            lazy={async () => {
              const { SearchRoute } = await import('../routes');
              return {
                Component: SearchRoute,
              };
            }}
          />
          <Route
            path=":courseType?/course/:courseKey/*"
            lazy={async () => {
              const { CourseRoute } = await import('../routes');
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
