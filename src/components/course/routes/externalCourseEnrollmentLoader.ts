import { generatePath, redirect } from 'react-router-dom';

import {
  extractEnterpriseCustomer,
  getLateEnrollmentBufferDays,
  queryCanRedeem,
  queryCourseMetadata,
  queryRedeemablePolicies,
} from '../../app/data';
import { ensureAuthenticatedUser } from '../../app/routes/data';

type ExternalCourseEnrollmentRouteParams<Key extends string = string> = Types.RouteParams<Key> & {
  readonly courseType: string;
  readonly courseKey: string;
  readonly courseRunKey: string;
  readonly enterpriseSlug: string;
};
interface ExternalCourseEnrollmentLoaderFunctionArgs extends Types.RouteLoaderFunctionArgs {
  params: ExternalCourseEnrollmentRouteParams;
}

const makeExternalCourseEnrollmentLoader: Types.MakeRouteLoaderFunctionWithQueryClient = (
  function makeExternalCourseEnrollmentLoader(queryClient) {
    return async function externalCourseEnrollmentLoader(
      { params, request }: ExternalCourseEnrollmentLoaderFunctionArgs,
    ) {
      const requestUrl = new URL(request.url);
      const authenticatedUser = await ensureAuthenticatedUser(requestUrl, params);
      // User is not authenticated, so we can't do anything in this loader.
      if (!authenticatedUser) {
        return null;
      }

      const {
        enterpriseSlug,
        courseType,
        courseKey,
        courseRunKey,
      } = params;
      const enterpriseCustomer = await extractEnterpriseCustomer({
        requestUrl,
        queryClient,
        authenticatedUser,
        enterpriseSlug,
      });
      if (!enterpriseCustomer) {
        return null;
      }
      // Fetch course metadata, and then check if the user can redeem the course.
      // TODO: This should be refactored such that `can-redeem` can be called independently
      // of `course-metadata` to avoid an unnecessary request waterfall.
      await queryClient.ensureQueryData(queryCourseMetadata(courseKey, courseRunKey)).then(async (courseMetadata) => {
        if (!courseMetadata) {
          return;
        }
        const redeemableLearnerCreditPolicies = await queryClient.ensureQueryData(queryRedeemablePolicies({
          enterpriseUuid: enterpriseCustomer.uuid,
          lmsUserId: authenticatedUser.userId,
        }));
        const lateEnrollmentBufferDays = getLateEnrollmentBufferDays(
          redeemableLearnerCreditPolicies.redeemablePolicies,
        );
        const canRedeem = await queryClient.ensureQueryData(
          queryCanRedeem(enterpriseCustomer.uuid, courseMetadata, lateEnrollmentBufferDays),
        );
        const hasSuccessfulRedemption = !!canRedeem.find(r => r.contentKey === courseRunKey)?.hasSuccessfulRedemption;
        if (hasSuccessfulRedemption) {
          const redirectUrl = generatePath(
            '/:enterpriseSlug/:courseType/course/:courseKey/enroll/:courseRunKey/complete',
            {
              enterpriseSlug,
              courseType,
              courseKey,
              courseRunKey,
            },
          );
          throw redirect(redirectUrl);
        }
      });

      return null;
    };
  }
);

export default makeExternalCourseEnrollmentLoader;
