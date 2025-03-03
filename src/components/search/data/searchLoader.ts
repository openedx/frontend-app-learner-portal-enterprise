import { generatePath, redirect } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform/config';
import { ensureAuthenticatedUser } from '../../app/routes/data/utils';
import { extractEnterpriseCustomer, queryAcademiesList, queryContentHighlightSets } from '../../app/data';

type SearchRouteParams<Key extends string = string> = Types.RouteParams<Key> & {
  readonly enterpriseSlug: string;
};
interface SearchLoaderFunctionArgs extends Types.RouteLoaderFunctionArgs {
  params: SearchRouteParams;
}
interface Academy {
  uuid: string;
}

const makeSearchLoader: Types.MakeRouteLoaderFunctionWithQueryClient = function makeSearchLoader(queryClient) {
  return async function searchLoader({ params, request } : SearchLoaderFunctionArgs) {
    const requestUrl = new URL(request.url);
    const authenticatedUser = await ensureAuthenticatedUser(requestUrl, params);

    // User is not authenticated, so we can't do anything in this loader.
    if (!authenticatedUser) {
      return null;
    }

    const { enterpriseSlug } = params;

    const enterpriseCustomer = await extractEnterpriseCustomer({
      requestUrl,
      queryClient,
      authenticatedUser,
      enterpriseSlug,
    });
    if (!enterpriseCustomer) {
      return null;
    }

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

    const academies = queryClient.getQueryData<Academy[]>(academiesListQuery.queryKey);
    if (enterpriseCustomer.enableOneAcademy && academies?.length === 1) {
      const redirectPath = generatePath('/:enterpriseSlug/academies/:academyUUID', {
        enterpriseSlug,
        academyUUID: academies[0].uuid,
      });
      return redirect(redirectPath);
    }

    return null;
  };
};

export default makeSearchLoader;
