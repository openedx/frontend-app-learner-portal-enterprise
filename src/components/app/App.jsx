import {
  lazy,
  Suspense,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  Outlet,
  useRouteError,
  useParams,
  ScrollRestoration,
  useFetchers,
  useNavigation,
  generatePath,
  useAsyncError,
  Link,
} from 'react-router-dom';
import NProgress from 'nprogress';
import { Helmet } from 'react-helmet';
import { Container } from '@edx/paragon';
import {
  AppContext,
  AppProvider,
  AuthenticatedPageRoute,
  ErrorPage,
} from '@edx/frontend-platform/react';
import { logError } from '@edx/frontend-platform/logging';
import SiteFooter from '@edx/frontend-component-footer';
import {
  UseQueryResult,
  QueryCache,
  QueryClient,
  QueryClientProvider,
  useQueries,
  useQuery,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import NoticesProvider from '../notices-provider';
import { queryCacheOnErrorHandler, defaultQueryClientRetryHandler } from '../../utils/common';
import { ToastsProvider, Toasts } from '../Toasts';
import DelayedFallbackContainer from '../DelayedFallback/DelayedFallbackContainer';
import extractNamedExport from '../../utils/extract-named-export';
import makeRootLoader, {
  makeBrowseAndRequestConfigurationQuery,
  makeContentHighlightsConfigurationQuery,
  makeCouponCodesQuery,
  makeEnterpriseLearnerOffersQuery,
  makeEnterpriseLearnerQuery,
  makeRedeemablePoliciesQuery,
  makeSubscriptionsQuery,
} from './routes/loaders/rootLoader';
import makeCourseLoader, {
  makeCanRedeemQuery,
  makeCourseMetadataQuery,
  makeEnterpriseCourseEnrollmentsQuery,
  makeUserEntitlementsQuery,
} from './routes/loaders/courseLoader';

import { SiteHeader } from '../site-header';
import { EnterpriseBanner } from '../enterprise-banner';
import { useStylesForCustomBrandColors } from '../layout/data/hooks';
import { DEFAULT_TITLE, TITLE_TEMPLATE } from '../layout/Layout';
import makeDashboardLoader from './routes/loaders/dashboardLoader';
import makeUpdateActiveEnterpriseCustomerUserLoader from './routes/loaders/updateActiveEnterpriseCustomerUserLoader';

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
      // Specifying a longer `staleTime` of 60 seconds means queries will not refetch their data
      // as often; mitigates making duplicate queries when within the `staleTime` window, instead
      // relying on the cached data until the `staleTime` window has exceeded. This may be modified
      // per-query, as needed, if certain queries expect to be more up-to-date than others. Allows
      // `useQuery` to be used as a state manager.
      staleTime: 1000 * 60,
    },
  },
});

// Determines amount of time that must elapse before the
// NProgress loader is shown in the UI. No need to show it
// for quick route transitions.
const NPROGRESS_DELAY_MS = 300;

const Root = () => {
  const navigation = useNavigation();
  const fetchers = useFetchers();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const fetchersIdle = fetchers.every((f) => f.state === 'idle');
      if (navigation.state === 'idle' && fetchersIdle) {
        NProgress.done();
      } else {
        NProgress.start();
      }
    }, NPROGRESS_DELAY_MS);
    return () => clearTimeout(timeoutId);
  }, [navigation, fetchers]);

  return (
    <NoticesProvider>
      <ToastsProvider>
        <Toasts />
        <Suspense fallback={<DelayedFallbackContainer />}>
          <Outlet />
        </Suspense>
      </ToastsProvider>
      <ScrollRestoration />
    </NoticesProvider>
  );
};

/**
 * Retrieves the enterprise learner data for the authenticated user.
 *
 * @returns {UseQueryResult} The query results for the enterprise learner data.
 */
export const useEnterpriseLearner = () => {
  const { authenticatedUser } = useContext(AppContext);
  const { enterpriseSlug } = useParams();
  return useQuery({
    ...makeEnterpriseLearnerQuery(authenticatedUser.username, enterpriseSlug),
    // Disable refetch on window focus, mount, and reconnect to prevent
    // unnecessary refetches when the active enterprise customer changes
    // from external sources (e.g., Admin Portal, Learner Portal for a
    // different customer in a separate window/tab). The tradeoff is that
    // the user must perform a full-page refresh  to retrieve updated enterprise
    // customer metadata (e.g., title, branding). However, all other queries should
    // continue to have the default refetch behavior.
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

/**
 * Retrieves the subsidies present for the active enterprise customer user.
 * @returns {UseQueryResult} The query results for the enterprise customer user subsidies.
 */
export const useEnterpriseCustomerUserSubsidies = () => {
  const { authenticatedUser } = useContext(AppContext);
  const { userId, email } = authenticatedUser;
  const { data } = useEnterpriseLearner();
  const enterpriseId = data.activeEnterpriseCustomer.uuid;
  const queries = useQueries({
    queries: [
      makeSubscriptionsQuery(enterpriseId),
      makeRedeemablePoliciesQuery({
        enterpriseUuid: enterpriseId,
        lmsUserId: userId,
      }),
      makeCouponCodesQuery(enterpriseId),
      makeEnterpriseLearnerOffersQuery(enterpriseId),
      makeBrowseAndRequestConfigurationQuery(enterpriseId, email),
    ],
  });
  return {
    data: {
      subscriptions: queries[0].data,
      redeemablePolicies: queries[1].data,
      couponCodes: queries[2].data,
      enterpriseLearnerOffers: queries[3].data,
      browseAndRequest: queries[4].data,
    },
  };
};

/**
 * Retrieves the course metadata for the given enterprise customer and course key.
 * @returns {UseQueryResult} The query results for the course metadata.
 */
const useCourseMetadata = () => {
  const { courseKey } = useParams();
  const { data: { activeEnterpriseCustomer } } = useEnterpriseLearner();
  const enterpriseId = activeEnterpriseCustomer.uuid;
  return useQuery(
    makeCourseMetadataQuery(enterpriseId, courseKey),
  );
};

/**
 * Retrieves the course redemption eligibility for the given enterprise customer and course key.
 * @returns {UseQueryResult} The query results for the course redemption eligibility.
 */
const useCourseRedemptionEligibility = () => {
  const { data: { activeEnterpriseCustomer } } = useEnterpriseLearner();
  const { data: courseMetadata } = useCourseMetadata();
  const enterpriseId = activeEnterpriseCustomer.uuid;
  return useQuery(
    makeCanRedeemQuery(enterpriseId, courseMetadata),
  );
};

/**
 * Retrieves the enterprise course enrollments for the active enterprise customer user.
 * @returns {UseQueryResult} The query results for the enterprise course enrollments.
 */
const useEnterpriseCourseEnrollments = () => {
  const { data: { activeEnterpriseCustomer } } = useEnterpriseLearner();
  const enterpriseId = activeEnterpriseCustomer.uuid;
  return useQuery(
    makeEnterpriseCourseEnrollmentsQuery(enterpriseId),
  );
};

/**
 * Retrieves the user entitlements.
 * @returns {UseQueryResult} The query results for the user entitlements.
 */
const useUserEntitlements = () => useQuery(
  makeUserEntitlementsQuery(),
);

/**
 * Retrieves the content highlights configuration for the active enterprise customer user.
 * @returns {UseQueryResult} The query results for the content highlights configuration.
 */
export const useContentHighlightsConfiguration = () => {
  const { data: { activeEnterpriseCustomer } } = useEnterpriseLearner();
  const enterpriseId = activeEnterpriseCustomer.uuid;
  return useQuery(
    makeContentHighlightsConfigurationQuery(enterpriseId),
  );
};

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
  const { data: { activeEnterpriseCustomer } } = useEnterpriseLearner();
  return (
    <Container size="lg" className="py-4">
      <h2>Search</h2>
      <Link
        to={generatePath('/:enterpriseSlug/course/:courseKey', {
          enterpriseSlug: activeEnterpriseCustomer.slug,
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
  const {
    data: courseMetadata,
  } = useCourseMetadata();
  const {
    data: courseRedemptionEligiblity,
  } = useCourseRedemptionEligibility();
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
            )?.redeemableSubsidyAccessPolicy?.uuid,
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

const Layout = () => {
  const { authenticatedUser } = useContext(AppContext);
  const { data: enterpriseLearnerData } = useEnterpriseLearner();

  const brandStyles = useStylesForCustomBrandColors(enterpriseLearnerData?.activeEnterpriseCustomer);

  // Authenticated user is NOT linked an enterprise customer, so
  // render the not found page.
  if (!enterpriseLearnerData.activeEnterpriseCustomer) {
    return <NotFoundPage />;
  }

  // User is authenticated with an active enterprise customer, but
  // the user account API data is still hydrating. If it is still
  // hydrating, render a loading state.
  if (!authenticatedUser.profileImage) {
    return (
      <DelayedFallbackContainer
        className="py-5 text-center"
        screenReaderText="Loading your account details. Please wait."
      />
    );
  }

  return (
    <>
      <Helmet titleTemplate={TITLE_TEMPLATE} defaultTitle={DEFAULT_TITLE}>
        <html lang="en" />
        {brandStyles.map(({ key, styles }) => (
          <style key={key} type="text/css">{styles}</style>
        ))}
      </Helmet>
      <SiteHeader />
      <EnterpriseBanner />
      <main id="content" className="fill-vertical-space">
        <Outlet />
      </main>
      <SiteFooter />
    </>
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
          <Route path="" element={<NotFoundPage />} />
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
