import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { queryNotices } from '../queries';

/**
 * Responsible for returning the redirect URL for any notice(s) present
 * for the authenticated user.
 */
function useNotices(queryOptions = {}) {
  const queryResults = useQuery({
    ...queryNotices(),
    queryOptions,
  });

  useEffect(() => {
    if (!queryResults.data) {
      return;
    }
    window.location.assign(queryResults.data);
  }, [queryResults.data]);

  return queryResults;
}

export default useNotices;
