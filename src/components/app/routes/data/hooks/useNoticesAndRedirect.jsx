import { useQuery } from '@tanstack/react-query';
import { getConfig } from '@edx/frontend-platform/config';
import { queryNotices } from '../queries';
import { redirectToExternalNoticesPage } from '../utils';

export default async function useNoticesAndRedirect() {
  const { data } = await useQuery(
    {
      ...queryNotices(),
      enabled: !!getConfig().ENABLE_NOTICES,
    },
  );
  await redirectToExternalNoticesPage(data);
}
