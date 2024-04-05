import { getConfig } from '@edx/frontend-platform/config';
import { ensureAuthenticatedUser } from '../../app/routes/data';
import { extractEnterpriseId, queryAcademiesList, queryContentHighlightSets } from '../../app/data';

export default function makeSearchLoader(queryClient) {
  return async function searchLoader({ params = {}, request }) {
    const requestUrl = new URL(request.url);
    const authenticatedUser = await ensureAuthenticatedUser(requestUrl, params);

    if (!authenticatedUser) {
      return null;
    }

    const { enterpriseSlug } = params;

    const enterpriseId = await extractEnterpriseId({
      queryClient,
      authenticatedUser,
      enterpriseSlug,
    });
    const searchData = [
      queryClient.ensureQueryData(
        queryAcademiesList(enterpriseId),
      ),
    ];
    if (getConfig().FEATURE_CONTENT_HIGHLIGHTS) {
      searchData.push(
        queryClient.ensureQueryData(
          queryContentHighlightSets(enterpriseId),
        ),
      );
    }

    await Promise.all(searchData);

    return null;
  };
}
