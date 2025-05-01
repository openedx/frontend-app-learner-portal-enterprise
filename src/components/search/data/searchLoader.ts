import {
  generatePath, LoaderFunctionArgs, Params, redirect,
} from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform/config';
import { ensureAuthenticatedUser } from '../../app/routes/data/utils';
import {
  extractEnterpriseCustomer,
  queryAcademiesList,
  safeEnsureQueryDataAcademiesList,
  safeEnsureQueryDataContentHighlightSets,
} from '../../app/data';

type SearchRouteParams<Key extends string = string> = Params<Key> & {
  readonly enterpriseSlug: string;
};
interface SearchLoaderFunctionArgs extends LoaderFunctionArgs {
  params: SearchRouteParams;
}
interface Academy {
  uuid: string;
}

const makeSearchLoader: MakeRouteLoaderFunctionWithQueryClient = function makeSearchLoader(queryClient) {
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

    const searchData = [
      safeEnsureQueryDataAcademiesList({
        queryClient,
        enterpriseCustomer,
      }),
    ];
    if (getConfig().FEATURE_CONTENT_HIGHLIGHTS) {
      searchData.push(
        safeEnsureQueryDataContentHighlightSets({
          queryClient,
          enterpriseCustomer,
        }),
      );
    }

    await Promise.all(searchData);

    const academiesListQuery = queryAcademiesList(enterpriseCustomer.uuid);
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
