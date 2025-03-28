import {
  extractEnterpriseCustomer,
  queryEnterpriseCourseEnrollments,
  queryLearnerProgramProgressData,
} from '../../app/data';
import { ensureAuthenticatedUser } from '../../app/routes/data';

type ProgramProgressRouteParams<Key extends string = string> = RouteParams<Key> & {
  readonly programUUID: string;
};
interface ProgramProgressLoaderFunctionArgs extends RouteLoaderFunctionArgs {
  params: ProgramProgressRouteParams;
}

const makeProgramProgressLoader: MakeRouteLoaderFunctionWithQueryClient = (
  function makeProgramProgressLoader(queryClient) {
    return async function programProgressLoader({ params, request }: ProgramProgressLoaderFunctionArgs) {
      const requestUrl = new URL(request.url);

      const authenticatedUser = await ensureAuthenticatedUser(requestUrl, params);
      // User is not authenticated, so we can't do anything in this loader.
      if (!authenticatedUser) {
        return null;
      }

      const { enterpriseSlug, programUUID } = params;

      // Extract enterprise customer.
      const enterpriseCustomer = await extractEnterpriseCustomer({
        requestUrl,
        queryClient,
        authenticatedUser,
        enterpriseSlug,
      });
      if (!enterpriseCustomer) {
        return null;
      }
      const queriesToResolve = [
        queryClient.ensureQueryData(queryLearnerProgramProgressData(programUUID)),
        queryClient.ensureQueryData(queryEnterpriseCourseEnrollments(enterpriseCustomer.uuid)),
      ];
      await Promise.all(queriesToResolve);

      return null;
    };
  }
);

export default makeProgramProgressLoader;
