import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export function useActiveQueryParams() {
  const location = useLocation();
  const activeQueryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  return activeQueryParams;
}
