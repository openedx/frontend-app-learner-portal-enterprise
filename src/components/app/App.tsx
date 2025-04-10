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

// @ts-ignore
const ReactQueryDevtoolsProduction = lazy(() => import('@tanstack/react-query-devtools/production').then((d) => ({
  default: d.ReactQueryDevtools,
})));

function useAppQueryClient() {
  const [queryClient] = useState(() => new QueryClient({
    queryCache: new QueryCache({
      onError: queryCacheOnErrorHandler,
    }),
    defaultOptions: {
      queries: {
        // Specifying a longer `staleTime` of 20 seconds means queries will not refetch their data
        // as often; mitigates making duplicate queries when within the `staleTime` window, instead
        // relying on the cached data until the `staleTime` window has exceeded. This may be modified
        // per-query, as needed, if certain queries expect to be more up-to-date than others. Allows
        // `useQuery` to be used as a state manager.
        staleTime: 1000 * 20, // 20 seconds
        // To prevent hard loading states if/when query keys change during automatic query background
        // re-fetches, we can set `keepPreviousData` to `true` to keep the previous data until the new
        // data is fetched. By enabling this option, UI components generally will not need to consider
        // explicit loading states when query keys change.
        placeholderData: keepPreviousData,
        // TODO: Write why.
        throwOnError: false,
        // TODO: Write purpose.
        retry: defaultQueryClientRetryHandler,
      },
    },
  }));
  return queryClient;
}

function useReactQueryDevTools() {
  const [showReactQueryDevtools, setShowReactQueryDevtools] = useState(false);
  useEffect(() => {
    // @ts-ignore
    window.toggleReactQueryDevtools = () => setShowReactQueryDevtools((prevState) => !prevState);
  });
  return showReactQueryDevtools;
}

const App = () => {
  const queryClient = useAppQueryClient();

  // Create the app router during render vs. at the top-level of the module to ensure
  // the logging and auth modules are initialized before the router is created.
  const router = useMemo(() => createAppRouter(queryClient), [queryClient]);

  const showReactQueryDevtools = useReactQueryDevTools();

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
