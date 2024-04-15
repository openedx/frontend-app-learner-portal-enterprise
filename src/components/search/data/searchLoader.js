import { getConfig } from '@edx/frontend-platform/config';
import { ensureAuthenticatedUser } from '../../app/routes/data';
import { extractEnterpriseCustomer, queryAcademiesList, queryContentHighlightSets } from '../../app/data';

export default function makeSearchLoader(queryClient) {
  return async function searchLoader({ params = {}, request }) {
    const requestUrl = new URL(request.url);
    const authenticatedUser = await ensureAuthenticatedUser(requestUrl, params);

    if (!authenticatedUser) {
      return null;
    }

    const { enterpriseSlug } = params;

    const enterpriseCustomer = await extractEnterpriseCustomer({
      queryClient,
      authenticatedUser,
      enterpriseSlug,
    });
    const searchData = [
      queryClient.ensureQueryData(
        queryAcademiesList(enterpriseCustomer.uuid),
      ),
    ];
    if (getConfig().FEATURE_CONTENT_HIGHLIGHTS) {
      searchData.push(
        queryClient.ensureQueryData(
          queryContentHighlightSets(enterpriseCustomer.uuid),
        ),
      );
    }

    await Promise.all(searchData);

    return null;
  };
}
