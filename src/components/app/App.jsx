import { RouterProvider } from 'react-router-dom';
import { AppProvider } from '@edx/frontend-platform/react';
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import {
  queryCacheOnErrorHandler,
  defaultQueryClientRetryHandler,
} from '../../utils/common';
// import extractNamedExport from '../../utils/extract-named-export';

import createAppRouter from './data/createAppRouter';

/* eslint-disable max-len */
// const EnterpriseAppPageRoutes = lazy(() => import(/* webpackChunkName: "enterprise-app-routes" */ './EnterpriseAppPageRoutes'));
// const EnterpriseInvitePage = lazy(() => extractNamedExport(import(/* webpackChunkName: "enterprise-invite" */ '../enterprise-invite'), 'EnterpriseInvitePage'));
/* eslint-enable no-unused-vars */

// Create a query client for @tanstack/react-query
export const queryClient = new QueryClient({
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

const router = createAppRouter(queryClient);

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
          <Route path="/invite/:enterpriseCustomerInviteKey" element={<PageWrap><EnterpriseInvitePage /></PageWrap>} />
          <Route path="/:enterpriseSlug/*" element={<EnterpriseAppPageRoutes />} />
        </Routes>
      </Suspense> */}
    </AppProvider>
  </QueryClientProvider>
);

export default App;
