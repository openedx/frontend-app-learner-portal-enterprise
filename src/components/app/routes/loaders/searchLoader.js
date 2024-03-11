import { getConfig } from '@edx/frontend-platform/config';
import { ensureAuthenticatedUser } from '../data';
import { extractEnterpriseId, queryAcademiesList, queryContentHighlights } from '../../data';

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
          queryContentHighlights(enterpriseId),
        ),
      );
    }

    await Promise.all(searchData);
    return null;
  };
}
