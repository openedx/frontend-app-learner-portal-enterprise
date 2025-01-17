import {
  Suspense, lazy, useEffect, useState,
} from 'react';
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

import { AppSuspenseFallback, RouterFallback, createAppRouter } from './routes';

// eslint-disable-next-line import/no-unresolved
const ReactQueryDevtoolsProduction = lazy(() => import('@tanstack/react-query-devtools/production').then((d) => ({
  default: d.ReactQueryDevtools,
})));

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
      staleTime: 1000 * 20, // 20 seconds
      // By extending `cacheTime`from the default of 5 minutes, we can prevent inactive queries from being garbage
      // collected for a longer duration of time. Inactive queries are those that have no rendered query observers
      // (e.g., `useQuery` hooks). Since most UI component assumes data will be available and returned by queries
      // without having to consider hard loading states, extending the `cacheTime` can help prevent JS errors around
      // accessing properties on `undefined` data (due to it being in a hard loading state, `isLoading: true`) by
      // delaying when `@tanstack/react-query` garbage collects inactive queries.
      cacheTime: 1000 * 60 * 30, // 30 minutes
      // To prevent hard loading states if/when query keys change during automatic query background
      // re-fetches, we can set `keepPreviousData` to `true` to keep the previous data until the new
      // data is fetched. By enabling this option, UI components generally will not need to consider
      // explicit loading states when query keys change. Note: `keepPreviousData` is deprecated, replaced
      // by `placeholderData` in `@tanstack/react-query` v5 (i.e., for when React is upgraded to v18). See
      // https://tanstack.com/query/latest/docs/framework/vue/guides/migrating-to-v5#removed-keeppreviousdata-in-favor-of-placeholderdata-identity-function
      // for more details.
      keepPreviousData: true,
      // Suspense mode on queries enables loading/error states to be caught and handled by a surrounding
      // `Suspense` component from React, with a fallback UI component to display while the query is resolving.
      // Generally, queries should be resolved within a route loader so it's "guaranteed" to exist within the UI
      // components. However, in some cases (e.g., if a query is reset), we attempt to access object properties
      // on `undefined` data (i.e., `isLoading: true`) resulting in JS errors. To prevent this error from throwing,
      // by enabling suspenseful queries, we can trigger a loading state via a `Suspense` fallback component while
      // queries that were removed/reset/garbage collected are re-fetched.
      suspense: true,
    },
  },
});

const App = () => {
  const [showReactQueryDevtools, setShowReactQueryDevtools] = useState(false);
  useEffect(() => {
    window.toggleReactQueryDevtools = () => setShowReactQueryDevtools((prevState) => !prevState);
  });

  // Create the app router during render vs. at the top-level of the module to ensure
  // the logging and auth modules are initialized before the router is created.
  const router = createAppRouter(queryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      {showReactQueryDevtools && (
        <Suspense fallback={null}>
          <ReactQueryDevtoolsProduction />
        </Suspense>
      )}
      <AppProvider wrapWithRouter={false}>
        <Suspense fallback={<AppSuspenseFallback />}>
          <RouterProvider
            router={router}
            fallbackElement={<RouterFallback />}
          />
        </Suspense>
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;
