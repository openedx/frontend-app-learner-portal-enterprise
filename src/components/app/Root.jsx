import {
  Outlet, ScrollRestoration, useFetchers, useNavigation,
} from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import NProgress from 'nprogress';

import DelayedFallbackContainer from '../DelayedFallback/DelayedFallbackContainer';
import { Toasts, ToastsProvider } from '../Toasts';
import NoticesProvider from '../notices-provider';

// Determines amount of time that must elapse before the
// NProgress loader is shown in the UI. No need to show it
// for quick route transitions.
export const NPROGRESS_DELAY_MS = 300;

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

export default Root;
