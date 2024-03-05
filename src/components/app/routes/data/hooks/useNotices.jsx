import { useQuery } from '@tanstack/react-query';
import { getConfig } from '@edx/frontend-platform/config';
import { queryNotices } from '../queries';

export default function useNotices() {
  return useQuery(
    {
      ...queryNotices(),
      enabled: !!getConfig().ENABLE_NOTICES,
    },
  );
}
