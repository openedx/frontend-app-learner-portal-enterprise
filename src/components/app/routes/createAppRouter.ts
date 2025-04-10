import { QueryClient } from '@tanstack/react-query';
import { createBrowserRouter } from 'react-router-dom';

import { getRoutes } from '../../../routes';

/**
 * Creates a React Router browser router.
 *
 * @param {Object} queryClient React Query query client.
 * @returns {Object} React Router browser router.
 */
export default function createAppRouter(queryClient: QueryClient): Router {
  const { routes } = getRoutes(queryClient);
  const router = createBrowserRouter(routes);
  return router;
}
