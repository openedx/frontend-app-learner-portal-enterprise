import {
  lazy,
  Suspense,
  useContext,
  useEffect,
} from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  Outlet,
  useLoaderData,
  Await,
  useRouteError,
  useParams,
  ScrollRestoration,
  useFetchers,
  useNavigation,
  generatePath,
  useAsyncError,
} from 'react-router-dom';
import NProgress from 'nprogress';
import {
  AppContext,
  AppProvider,
  AuthenticatedPageRoute,
  ErrorPage,
} from '@edx/frontend-platform/react';
import { logError } from '@edx/frontend-platform/logging';
import SiteFooter from '@edx/frontend-component-footer';
import {
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
  makeCanRedeemCourseLoader,
  makeCanRedeemQuery,
  makeCourseMetadataQuery,
  makeEnterpriseCourseEnrollmentsQuery,
  makeUserEntitlementsQuery,
} from './routes/loaders/courseLoader';

import { SiteHeader } from '../site-header';
import { EnterpriseBanner } from '../enterprise-banner';
import { useStylesForCustomBrandColors } from '../layout/data/hooks';
import { Helmet } from 'react-helmet';
import { DEFAULT_TITLE, TITLE_TEMPLATE } from '../layout/Layout';
import { Container } from '@edx/paragon';
import { Link } from 'react-router-dom';

const EnterpriseCustomerRedirect = lazy(() => import(/* webpackChunkName: "enterprise-customer-redirect" */ '../enterprise-redirects/EnterpriseCustomerRedirect'));
const EnterprisePageRedirect = lazy(() => import(/* webpackChunkName: "enterprise-page-redirect" */ '../enterprise-redirects/EnterprisePageRedirect'));
const NotFoundPage = lazy(() => import(/* webpackChunkName: "not-found" */ '../NotFoundPage'));
const EnterpriseAppPageRoutes = lazy(() => import(/* webpackChunkName: "enterprise-app-routes" */ './EnterpriseAppPageRoutes'));
const EnterpriseInvitePage = lazy(() => extractNamedExport(import(/* webpackChunkName: "enterprise-invite" */ '../enterprise-invite'), 'EnterpriseInvitePage'));

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

const Root = () => (
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

export const useEnterpriseLearner = () => {
  const { authenticatedUser } = useContext(AppContext);
  return useQuery(
    makeEnterpriseLearnerQuery(authenticatedUser.username),
  );
};

const useEnterpriseCustomerUserSubsidies = () => {
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
      browseAndRequestConfiguration: queries[4].data,
    },
  };
};

const useCourseMetadata = () => {
  const { courseKey } = useParams();
  const { data: { activeEnterpriseCustomer } } = useEnterpriseLearner();
  const enterpriseId = activeEnterpriseCustomer.uuid;
  return useQuery(
    makeCourseMetadataQuery(enterpriseId, courseKey),
  );
};

const useCourseRedemptionEligibility = () => {
  const { data: { activeEnterpriseCustomer } } = useEnterpriseLearner();
  const { data: courseMetadata } = useCourseMetadata();
  const enterpriseId = activeEnterpriseCustomer.uuid;
  return useQuery(
    makeCanRedeemQuery(enterpriseId, courseMetadata),
  );
};

const useEnterpriseCourseEnrollments = () => {
  const { data: { activeEnterpriseCustomer } } = useEnterpriseLearner();
  const enterpriseId = activeEnterpriseCustomer.uuid;
  return useQuery(
    makeEnterpriseCourseEnrollmentsQuery(enterpriseId),
  );
};

const useUserEntitlements = () => useQuery(
  makeUserEntitlementsQuery(),
);

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

const CourseWrapper = () => {
  const loaderData = useLoaderData();
  return (
    <Suspense
      fallback={(
        <DelayedFallbackContainer
          className="py-5 text-center"
          screenReaderText="Loading course details. Please wait."
        />
      )}
    >
      <Await
        resolve={loaderData.courseMetadata}
        errorElement={<RouteErrorBoundary />}
      >
        <Outlet />
      </Await>
    </Suspense>
  );
};

const Course = () => {
  const loaderData = useLoaderData();
  return (
    <Await
      resolve={loaderData?.canRedeem}
      errorElement={<RouteErrorBoundary />}
    >
      <CourseContents />
    </Await>
  );
};

const CourseContents = () => {
  const { courseKey } = useParams();
  const {
    data: courseMetadata,
  } = useCourseMetadata();
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
  const loaderData = useLoaderData();
  const navigation = useNavigation();
  const fetchers = useFetchers();

  const { authenticatedUser } = useContext(AppContext);
  const { data: enterpriseLearnerData } = useEnterpriseLearner();

  const brandStyles = useStylesForCustomBrandColors(enterpriseLearnerData.activeEnterpriseCustomer);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const fetchersIdle = fetchers.every((f) => f.state === 'idle');
      if (navigation.state === 'idle' && fetchersIdle) {
        NProgress.done();
      } else {
        NProgress.start();
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [navigation, fetchers]);

  // TODO: possibly related to unauthorized access 404 instead of redirect to logistration?
  if (!enterpriseLearnerData.activeEnterpriseCustomer) {
    return <NotFoundPage />;
  }

  if (!authenticatedUser.profileImage) {
    return (
      <DelayedFallbackContainer
        className="py-5 text-center"
        screenReaderText="Loading account details. Please wait."
      />
    );
  }

  return (
    <Suspense
      fallback={(
        <DelayedFallbackContainer
          className="py-5 text-center"
          screenReaderText="Loading details for your organization. Please wait."
        />
      )}
    >
      <Await
        resolve={loaderData.enterpriseAppData}
        errorElement={<RouteErrorBoundary />}
      >
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
        {/* <Container size="lg" className="py-4">
          <h5><code>exec-ed-2u-integration-qa</code></h5>
          <nav>
            <ul>
              <li>
                <NavLink
                  to={generatePath('/:enterpriseSlug', {
                    enterpriseSlug: 'exec-ed-2u-integration-qa',
                  })}
                  end
                >
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink
                  to={generatePath('/:enterpriseSlug/search', {
                    enterpriseSlug: 'exec-ed-2u-integration-qa',
                  })}
                >
                  Search
                </NavLink>
              </li>
              <li>
                <NavLink
                  to={generatePath('/:enterpriseSlug/course/:courseKey', {
                    enterpriseSlug: 'exec-ed-2u-integration-qa',
                    courseKey: 'edx+tr1012',
                  })}
                >
                  Course
                </NavLink>
              </li>
            </ul>
          </nav>
          <h5><code>pied-piper</code></h5>
          <nav>
            <ul>
              <li>
                <NavLink
                  to={generatePath('/:enterpriseSlug', {
                    enterpriseSlug: 'pied-piper',
                  })}
                  end
                >
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink
                  to={generatePath('/:enterpriseSlug/search', {
                    enterpriseSlug: 'pied-piper',
                  })}
                >
                  Search
                </NavLink>
              </li>
              <li>
                <NavLink
                  to={generatePath('/:enterpriseSlug/course/:courseKey', {
                    enterpriseSlug: 'pied-piper',
                    courseKey: 'edX+DemoX',
                  })}
                >
                  Course
                </NavLink>
              </li>
            </ul>
          </nav>
        </Container> */}
      </Await>
    </Suspense>
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
        loader={makeRootLoader(queryClient)}
        element={<Layout />}
      >
        <Route
          index
          element={<Dashboard />}
        />
        <Route
          path="search"
          element={<Search />}
        />
        <Route
          path=":courseType?/course/:courseKey/*"
          element={<CourseWrapper />}
          loader={makeCourseLoader(queryClient)}
        >
          <Route
            index
            element={<Course />}
            loader={makeCanRedeemCourseLoader(queryClient)}
          />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
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
