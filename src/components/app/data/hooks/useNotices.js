import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { queryNotices } from '../../routes/data';

function useNotices() {
  const queryResults = useQuery(queryNotices());

  useEffect(() => {
    if (queryResults.data) {
      window.location.assign(queryResults.data);
    }
  }, [queryResults]);

  return queryResults;
}

export default useNotices;
