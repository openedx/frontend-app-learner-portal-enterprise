import { queryLearnerPathwayProgressData } from '../../app/data';
import { ensureAuthenticatedUser } from '../../app/routes/data';

export default function makePathwayProgressLoader(queryClient) {
  return async function pathwayProgressLoader({ params = {}, request }) {
    const requestUrl = new URL(request.url);

    const authenticatedUser = await ensureAuthenticatedUser(requestUrl, params);
    // User is not authenticated, so we can't do anything in this loader.
    if (!authenticatedUser) {
      return null;
    }

    const { pathwayUUID } = params;

    await queryClient.ensureQueryData(queryLearnerPathwayProgressData(pathwayUUID));

    return null;
  };
}
