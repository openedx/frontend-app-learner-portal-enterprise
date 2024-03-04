import { useQuery } from '@tanstack/react-query';
import { getConfig } from '@edx/frontend-platform/config';
import { queryNotices } from '../../queries';

export default async function useNotices() {
  const { data } = await useQuery(
    {
      ...queryNotices(),
      enabled: !!getConfig().ENABLE_NOTICES,
    },
  );
  if (data?.results?.length > 0) {
    const { results } = data;
    window.location.replace(`${results[0]}?next=${window.location.href}`);
  }
}
