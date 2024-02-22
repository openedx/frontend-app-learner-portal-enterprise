import { AuthenticatedPageRoute } from '@edx/frontend-platform/react';
import {
  Outlet,
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom';

import RouteErrorBoundary from '../routes/RouteErrorBoundary';
import {
  makeCourseLoader,
  makeRootLoader,
  makeUpdateActiveEnterpriseCustomerUserLoader,
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
        element={<AuthenticatedPageRoute><Root /></AuthenticatedPageRoute>}
        errorElement={<RouteErrorBoundary />}
      >
        <Route
          path="/:enterpriseSlug?"
          loader={makeUpdateActiveEnterpriseCustomerUserLoader(queryClient)}
          element={<Outlet />}
        >
          <Route
            path=""
            loader={makeRootLoader(queryClient)}
            element={<Layout />}
          >
            <Route
              index
              lazy={async () => {
                const { default: DashboardRoute } = await import('../routes/DashboardRoute');
                return {
                  Component: DashboardRoute,
                  loader: makeDashboardLoader(queryClient),
                };
              }}
            />
            <Route
              path="search"
              lazy={async () => {
                const { default: SearchRoute } = await import('../routes/SearchRoute');
                return {
                  Component: SearchRoute,
                };
              }}
            />
            <Route
              path=":courseType?/course/:courseKey/*"
              lazy={async () => {
                const { default: CourseRoute } = await import('../routes/CourseRoute');
                return {
                  Component: CourseRoute,
                  loader: makeCourseLoader(queryClient),
                };
              }}
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>,
    ),
  );
  return router;
}
