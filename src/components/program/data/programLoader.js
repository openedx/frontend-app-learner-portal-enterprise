import { ensureAuthenticatedUser } from '../../app/routes/data/utils';
import { extractEnterpriseId, queryEnterpriseProgram } from '../../app/data';

export default function makeProgramLoader(queryClient) {
  return async function programLoader({ params = {}, request }) {
    const requestUrl = new URL(request.url);
    const authenticatedUser = await ensureAuthenticatedUser(requestUrl, params);
    // User is not authenticated, so we can't do anything in this loader.
    if (!authenticatedUser) {
      return null;
    }

    const { enterpriseSlug, programUuid } = params;

    const enterpriseId = await extractEnterpriseId({
      queryClient,
      authenticatedUser,
      enterpriseSlug,
    });

    const programData = [
      queryClient.ensureQueryData(
        queryEnterpriseProgram(enterpriseId, programUuid),
      ),
    ];

    await Promise.all(programData);

    return null;
  };
}
