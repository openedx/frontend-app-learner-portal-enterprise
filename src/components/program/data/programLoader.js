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

    const { enterpriseSlug, programUUID } = params;

    const enterpriseId = await extractEnterpriseId({
      queryClient,
      authenticatedUser,
      enterpriseSlug,
    });

    await queryClient.ensureQueryData(queryEnterpriseProgram(enterpriseId, programUUID));

    return null;
  };
}
