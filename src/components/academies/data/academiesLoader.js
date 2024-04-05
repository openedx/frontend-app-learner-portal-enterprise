import { ensureAuthenticatedUser } from '../../app/routes/data';
import { queryAcademiesDetail } from '../../app/data';

export default function makeAcademiesLoader(queryClient) {
  return async function academiesLoader({ params = {}, request }) {
    const requestUrl = new URL(request.url);

    const authenticatedUser = await ensureAuthenticatedUser(requestUrl, params);
    // User is not authenticated, so we can't do anything in this loader.
    if (!authenticatedUser) {
      return null;
    }

    const { academyUUID } = params;

    await queryClient.ensureQueryData(queryAcademiesDetail(academyUUID));

    return null;
  };
}
