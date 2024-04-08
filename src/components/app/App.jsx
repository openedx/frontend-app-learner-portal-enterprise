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

import { RouterFallback, createAppRouter } from './routes';

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
      staleTime: 1000 * 20,
      // To prevent hard loading states if/when query keys change during automatic query background
      // re-fetches, we can set `keepPreviousData` to `true` to keep the previous data until the new
      // data is fetched. By enabling this option, UI components generally will not need to consider
      // explicit loading states when query keys change. Note: `keepPreviousData` is deprecated, replaced
      // by `placeholderData` in `@tanstack/react-query` v5 (i.e., for when React is upgraded to v18). See
      // https://tanstack.com/query/latest/docs/framework/vue/guides/migrating-to-v5#removed-keeppreviousdata-in-favor-of-placeholderdata-identity-function
      // for more details.
      keepPreviousData: true,
    },
  },
});

const router = createAppRouter(queryClient);

const App = () => {
  const [showReactQueryDevtools, setShowReactQueryDevtools] = useState(false);
  useEffect(() => {
    window.toggleReactQueryDevtools = () => setShowReactQueryDevtools((prevState) => !prevState);
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      {showReactQueryDevtools && (
        <Suspense fallback={null}>
          <ReactQueryDevtoolsProduction />
        </Suspense>
      )}
      <AppProvider wrapWithRouter={false}>
        <RouterProvider
          router={router}
          fallbackElement={<RouterFallback />}
        />
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;
