import { lazy, useEffect } from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  Outlet,
  useRouteError,
  generatePath,
  useAsyncError,
  Link,
} from 'react-router-dom';
import { Container } from '@edx/paragon';
import {
  AppProvider,
  AuthenticatedPageRoute,
  ErrorPage,
} from '@edx/frontend-platform/react';
import { logError } from '@edx/frontend-platform/logging';
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
  useQueries,
  useQuery,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { queryCacheOnErrorHandler, defaultQueryClientRetryHandler } from '../../utils/common';
import extractNamedExport from '../../utils/extract-named-export';
import {
  makeDashboardLoader,
  makeUpdateActiveEnterpriseCustomerUserLoader,
  makeCourseLoader,
  makeRootLoader,
} from './routes/loaders';
import {
  useEnterpriseLearner,
  useCourseRedemptionEligibility,
  useEnterpriseCustomerUserSubsidies,
  useCourseMetadata,
  useEnterpriseCourseEnrollments,
  useUserEntitlements,
} from './data';
import Root from './Root';
import Layout from './Layout';

/* eslint-disable no-unused-vars */
const EnterpriseCustomerRedirect = lazy(() => import(/* webpackChunkName: "enterprise-customer-redirect" */ '../enterprise-redirects/EnterpriseCustomerRedirect'));
const EnterprisePageRedirect = lazy(() => import(/* webpackChunkName: "enterprise-page-redirect" */ '../enterprise-redirects/EnterprisePageRedirect'));
const NotFoundPage = lazy(() => import(/* webpackChunkName: "not-found" */ '../NotFoundPage'));
const EnterpriseAppPageRoutes = lazy(() => import(/* webpackChunkName: "enterprise-app-routes" */ './EnterpriseAppPageRoutes'));
const EnterpriseInvitePage = lazy(() => extractNamedExport(import(/* webpackChunkName: "enterprise-invite" */ '../enterprise-invite'), 'EnterpriseInvitePage'));
/* eslint-enable no-unused-vars */

// Create a query client for @tanstack/react-query
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: queryCacheOnErrorHandler,
  }),
  defaultOptions: {
    queries: {
      retry: defaultQueryClientRetryHandler,
      // Specifying a longer `staleTime` of 20 seconds means queries will not refetch their data
      // as often; mitigates making duplicate queries when within the `staleTime` window, instead
      // relying on the cached data until the `staleTime` window has exceeded. This may be modified
      // per-query, as needed, if certain queries expect to be more up-to-date than others. Allows
      // `useQuery` to be used as a state manager.
      staleTime: 1000 * 20,
    },
  },
});

const Dashboard = () => {
  const { data: enterpriseCustomerUserSubsidies } = useEnterpriseCustomerUserSubsidies();
  const {
    data: enterpriseCourseEnrollments,
    isLoading: isLoadingEnterpriseCourseEnrollments,
    isFetching: isFetchingEnterpriseCourseEnrollments,
  } = useEnterpriseCourseEnrollments();

  return (
    <Container size="lg" className="py-4">
      <h2>Dashboard</h2>
      <pre>
        {JSON.stringify(
          {
            enterpriseCourseEnrollments: {
              isLoading: isLoadingEnterpriseCourseEnrollments,
              isFetching: isFetchingEnterpriseCourseEnrollments,
              count: enterpriseCourseEnrollments?.length,
            },
            enterpriseCustomerUserSubsidies,
          },
          null,
          2,
        )}
      </pre>
    </Container>
  );
};

const Search = () => {
  const { data: enterpriseCustomerUserSubsidies } = useEnterpriseCustomerUserSubsidies();
  const { data: { enterpriseCustomer } } = useEnterpriseLearner();
  return (
    <Container size="lg" className="py-4">
      <h2>Search</h2>
      <Link
        to={generatePath('/:enterpriseSlug/course/:courseKey', {
          enterpriseSlug: enterpriseCustomer.slug,
          courseKey: 'edX+DemoX',
        })}
      >
        Course
      </Link>
      <br />
      <br />
      <pre>{JSON.stringify(enterpriseCustomerUserSubsidies, null, 2)}</pre>
    </Container>
  );
};

const Course = () => {
  const { data: courseMetadata } = useCourseMetadata();
  const { data: courseRedemptionEligiblity } = useCourseRedemptionEligibility();
  const {
    data: enterpriseCourseEnrollments,
    isLoading: isLoadingEnterpriseCourseEnrollments,
    isFetching: isFetchingEnterpriseCourseEnrollments,
  } = useEnterpriseCourseEnrollments();

  const {
    data: userEntitlements,
    isLoading: isUserEntitlementsLoading,
    isFetching: isUserEntitlementsFetching,
  } = useUserEntitlements();

  if (!courseMetadata) {
    return <NotFoundPage />;
  }

  return (
    <Container size="lg" className="py-4">
      <h2>Course</h2>
      <pre>
        {JSON.stringify(
          {
            courseMetadata: {
              title: courseMetadata.title,
              enrollmentUrl: courseMetadata.enrollmentUrl,
            },
            redeemableSubsidyAccessPolicy: courseRedemptionEligiblity.find(
              ({ canRedeem }) => canRedeem,
            )?.redeemableSubsidyAccessPolicy?.uuid ?? null,
            enterpriseCourseEnrollments: {
              isLoading: isLoadingEnterpriseCourseEnrollments,
              isFetching: isFetchingEnterpriseCourseEnrollments,
              count: enterpriseCourseEnrollments?.length || 0,
            },
            userEntitlements: {
              isLoading: isUserEntitlementsLoading,
              isFetching: isUserEntitlementsFetching,
              count: userEntitlements?.length || 0,
            },
          },
          null,
          2,
        )}
      </pre>
    </Container>
  );
};

const retrieveErrorBoundaryErrorMessage = (error) => {
  if (!error) {
    return null;
  }
  if (error.customAttributes) {
    return error.customAttributes.httpErrorResponseData;
  }
  return error.message;
};

const RouteErrorBoundary = () => {
  const routeError = useRouteError();
  const asyncError = useAsyncError();

  useEffect(() => {
    if (routeError) {
      logError(routeError);
    }
  }, [routeError]);

  useEffect(() => {
    if (asyncError) {
      logError(asyncError);
    }
  }, [asyncError]);

  const errorMessage = retrieveErrorBoundaryErrorMessage(routeError || asyncError);
  return <ErrorPage message={errorMessage} />;
};

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
            element={<Dashboard />}
            loader={makeDashboardLoader(queryClient)}
          />
          <Route
            path="search"
            element={<Search />}
          />
          <Route
            path=":courseType?/course/:courseKey/*"
            element={<Course />}
            loader={makeCourseLoader(queryClient)}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Route>,
  ),
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ReactQueryDevtools initialIsOpen={false} />
    <AppProvider wrapWithRouter={false}>
      <RouterProvider router={router} />
      {/* page routes for the app
      <Suspense fallback={(
        <DelayedFallbackContainer className="py-5 d-flex justify-content-center align-items-center" />
      )}
      >
        <Routes>
          <Route path="/" element={<AuthenticatedPageRoute><EnterpriseCustomerRedirect /></AuthenticatedPageRoute>} />
          <Route path="/r/*" element={<AuthenticatedPageRoute><EnterprisePageRedirect /></AuthenticatedPageRoute>} />
          <Route path="/invite/:enterpriseCustomerInviteKey" element={<PageWrap><EnterpriseInvitePage /></PageWrap>} />
          <Route path="/:enterpriseSlug/*" element={<EnterpriseAppPageRoutes />} />
          <Route path="*" element={<PageWrap><NotFoundPage /></PageWrap>} />
        </Routes>
      </Suspense> */}
    </AppProvider>
  </QueryClientProvider>
);

export default App;
