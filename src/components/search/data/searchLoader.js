import { generatePath, redirect } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform/config';
import { ensureAuthenticatedUser } from '../../app/routes/data/utils';
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

    const academiesListQuery = queryAcademiesList(enterpriseCustomer.uuid);

    const searchData = [queryClient.ensureQueryData(academiesListQuery)];
    if (getConfig().FEATURE_CONTENT_HIGHLIGHTS) {
      searchData.push(
        queryClient.ensureQueryData(
          queryContentHighlightSets(enterpriseCustomer.uuid),
        ),
      );
    }

    await Promise.all(searchData);

    const academies = queryClient.getQueryData(academiesListQuery.queryKey);
    if (enterpriseCustomer.enableOneAcademy && academies.length === 1) {
      const redirectPath = generatePath('/:enterpriseSlug/academies/:academyUUID', {
        enterpriseSlug,
        academyUUID: academies[0].uuid,
      });
      return redirect(redirectPath);
    }

    return null;
  };
}
