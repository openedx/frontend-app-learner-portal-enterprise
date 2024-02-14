import { useEffect, lazy, Suspense } from 'react';
import {
  Routes, Route, Navigate, useLocation,
} from 'react-router-dom';
import { AppProvider, AuthenticatedPageRoute, PageWrap } from '@edx/frontend-platform/react';
import { logError } from '@edx/frontend-platform/logging';
import { initializeHotjar } from '@edx/frontend-enterprise-hotjar';
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import NoticesProvider from '../notices-provider';
import { queryCacheOnErrorHandler, defaultQueryClientRetryHandler } from '../../utils/common';
import { ToastsProvider, Toasts } from '../Toasts';
import DelayedFallbackContainer from '../DelayedFallback/DelayedFallbackContainer';

const EnterpriseCustomerRedirect = lazy(() => import(/* webpackChunkName: "enterprise-customer-redirect" */ '../enterprise-redirects/EnterpriseCustomerRedirect'));
const EnterprisePageRedirect = lazy(() => import(/* webpackChunkName: "enterprise-page-redirect" */ '../enterprise-redirects/EnterprisePageRedirect'));
const NotFoundPage = lazy(() => import(/* webpackChunkName: "not-found" */ '../NotFoundPage'));
const EnterpriseAppPageRoutes = lazy(() => import(/* webpackChunkName: "enterprise-app-routes" */ './EnterpriseAppPageRoutes'));
const EnterpriseInvitePage = lazy(() => import(/* webpackChunkName: "enterprise-invite" */ '../enterprise-invite'));

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

const TruncatedLocation = () => {
  const location = useLocation();

  if (location.pathname.endsWith('/')) {
    return <Navigate to={location.pathname.slice(0, -1)} replace />;
  }
  return null;
};

const App = () => {
  // hotjar initialization
  useEffect(() => {
    if (process.env.HOTJAR_APP_ID) {
      try {
        initializeHotjar({
          hotjarId: process.env.HOTJAR_APP_ID,
          hotjarVersion: process.env.HOTJAR_VERSION,
          hotjarDebug: !!process.env.HOTJAR_DEBUG,
        });
      } catch (error) {
        logError(error);
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <AppProvider>
        <NoticesProvider>
          <ToastsProvider>
            <Toasts />
            {/* always remove trailing slashes from any route */}
            <TruncatedLocation />
            {/* page routes for the app */}
            <Suspense fallback={(
              <DelayedFallbackContainer
                className="py-5 d-flex justify-content-center align-items-center"
              />
            )}
            >
              <Routes>
                <Route path="/" element={<AuthenticatedPageRoute><EnterpriseCustomerRedirect /></AuthenticatedPageRoute>} />
                <Route path="/r/*" element={<AuthenticatedPageRoute><EnterprisePageRedirect /></AuthenticatedPageRoute>} />
                <Route path="/invite/:enterpriseCustomerInviteKey" element={<PageWrap><EnterpriseInvitePage /></PageWrap>} />
                <Route path="/:enterpriseSlug/*" element={<EnterpriseAppPageRoutes />} />
                <Route path="*" element={<PageWrap><NotFoundPage /></PageWrap>} />
              </Routes>
            </Suspense>
          </ToastsProvider>
        </NoticesProvider>
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;
