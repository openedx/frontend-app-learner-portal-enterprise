import { queryProgramProgressDetails } from '../../app/data';
import { ensureAuthenticatedUser } from '../../app/routes/data/utils';

export default function makeProgramProgressLoader(queryClient) {
  return async function programProgressLoader({ params = {}, request }) {
    const requestUrl = new URL(request.url);
    const authenticatedUser = await ensureAuthenticatedUser(requestUrl, params);
    // User is not authenticated, so we can't do anything in this loader.
    if (!authenticatedUser) {
      return null;
    }

    const { programUUID } = params;

    const programsProgressData = [
      queryClient.ensureQueryData(
        queryProgramProgressDetails(programUUID),
      ),
    ];

    await Promise.all(programsProgressData);

    return null;
  };
}
