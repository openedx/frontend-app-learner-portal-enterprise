import {
  Suspense, lazy, useEffect, useMemo, useState,
} from 'react';
import { RouterProvider } from 'react-router-dom';
import { AppProvider } from '@edx/frontend-platform/react';
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
  keepPreviousData,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import {
  queryCacheOnErrorHandler,
  defaultQueryClientRetryHandler,
} from '../../utils/common';
import { RouterFallback, createAppRouter } from './routes';

// eslint-disable-next-line import/no-unresolved
const ReactQueryDevtoolsProduction = lazy(() => import('@tanstack/react-query-devtools/production').then((d) => ({
  default: d.ReactQueryDevtools,
})));

const App = () => {
  const [queryClient] = useState(() => new QueryClient({
    queryCache: new QueryCache({
      onError: queryCacheOnErrorHandler,
    }),
    defaultOptions: {
      queries: {
        throwOnError: false,
        retry: defaultQueryClientRetryHandler,
        // Specifying a longer `staleTime` of 20 seconds means queries will not refetch their data
        // as often; mitigates making duplicate queries when within the `staleTime` window, instead
        // relying on the cached data until the `staleTime` window has exceeded. This may be modified
        // per-query, as needed, if certain queries expect to be more up-to-date than others. Allows
        // `useQuery` to be used as a state manager.
        staleTime: 1000 * 20, // 20 seconds
        // By extending `gcTime`from the default of 5 minutes, we can prevent inactive queries from being garbage
        // collected for a longer duration of time. Inactive queries are those that have no rendered query observers
        // (e.g., `useQuery` hooks). Since most UI components assume data will be available and returned by queries
        // without having to consider hard loading states, extending the `gcTime` can help prevent JS errors around
        // accessing properties on `undefined` data (due to it being in a hard loading state, `isLoading: true`) by
        // delaying when `@tanstack/react-query` garbage collects inactive queries.
        gcTime: 1000 * 60 * 30, // 30 minutes
        // To prevent hard loading states if/when query keys change during automatic query background
        // re-fetches, we can set `keepPreviousData` to `true` to keep the previous data until the new
        // data is fetched. By enabling this option, UI components generally will not need to consider
        // explicit loading states when query keys change.
        placeholderData: keepPreviousData,
      },
    },
  }));

  const [showReactQueryDevtools, setShowReactQueryDevtools] = useState(false);
  useEffect(() => {
    window.toggleReactQueryDevtools = () => setShowReactQueryDevtools((prevState) => !prevState);
  });

  // Create the app router during render vs. at the top-level of the module to ensure
  // the logging and auth modules are initialized before the router is created.
  const router = useMemo(() => createAppRouter(queryClient), [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      {showReactQueryDevtools && (
        <Suspense fallback={null}>
          <ReactQueryDevtoolsProduction />
        </Suspense>
      )}
      <AppProvider wrapWithRouter={false}>
        <Suspense fallback={<div>Loading...</div>}>
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
