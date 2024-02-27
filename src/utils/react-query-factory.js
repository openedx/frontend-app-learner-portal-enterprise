// eslint-disable-next-line import/no-extraneous-dependencies
import { createQueryKeyStore } from '@lukemorales/query-key-factory';
import { fetchCourseMetadata } from '../components/app/routes/queries/courseMetadata';
import { fetchUserEntitlements } from '../components/app/routes/queries/userEntitlements';
import { fetchCanRedeem } from '../components/app/routes/queries/canRedeemCourse';
import { fetchEnterpriseLearnerData } from '../components/app/routes/queries/enterpriseLearner';
import { fetchEnterpriseCourseEnrollments } from '../components/app/routes/queries/enterpriseCourseEnrollments';
import { fetchBrowseAndRequestConfiguration } from '../components/app/routes/queries/subsidies/browseAndRequest';
import { fetchRedeemablePolicies } from '../components/app/routes/queries/subsidies/policies';
import { fetchSubscriptions } from '../components/app/routes/queries/subsidies/subscriptions';
import { fetchCouponCodes } from '../components/app/routes/queries/subsidies/couponCodes';
import { fetchEnterpriseOffers } from '../components/app/routes/queries/subsidies/enterpriseOffers';
import { fetchEnterpriseCuration } from '../components/app/routes/queries/contentHighlights';

// The keys that map to enterpriseQueryKeys that is used to define specific queries
// and used to specifically invalidate queries
const enterprise = createQueryKeyStore('enterprise', {
  enterpriseCustomer: (enterpriseUuid) => ({
    queryKey: [enterpriseUuid],
    contextQueries: {
      course: (courseKey) => ({
        queryKey: [courseKey],
        contextQueries: {
          contentMetadata: {
            queryKey: null,
            queryFn: async ({ queryKey }) => fetchCourseMetadata(queryKey[2], queryKey[4]),
          },
          canRedeem: (availableCourseRunKeys) => ({
            queryKey: [availableCourseRunKeys],
            queryFn: async ({ queryKey }) => fetchCanRedeem(queryKey[2], availableCourseRunKeys),
          }),
        },
      }),
      user: {
        queryKey: ['entitlements'],
        queryFn: async () => fetchUserEntitlements(),
      },
      enrollments: {
        queryKey: null,
        queryFn: async ({ queryKey }) => fetchEnterpriseCourseEnrollments(queryKey[2]),
      },
      contentHighlights: {
        queryKey: null,
        contextQueries: {
          configuration: {
            queryKey: null,
            queryFn: async ({ queryKey }) => fetchEnterpriseCuration(queryKey[2]),
          },
        },
      },
    },
  }),
  enterpriseLearner: (username, enterpriseSlug) => ({
    queryKey: [username, enterpriseSlug],
    queryFn: async () => fetchEnterpriseLearnerData(username, enterpriseSlug),
  }),
  userSubsidy: (enterpriseUuid) => ({
    queryKey: [enterpriseUuid],
    contextQueries: {
      browseAndRequest: {
        queryKey: null,
        contextQueries: {
          configuration: (userEmail) => ({
            queryKey: [userEmail],
            queryFn: async ({ queryKey }) => fetchBrowseAndRequestConfiguration(queryKey[2], userEmail),
          }),
        },
      },
      subscriptions: {
        queryKey: null,
        queryFn: async ({ queryKey }) => fetchSubscriptions(queryKey[2]),
      },
      policy: {
        queryKey: null,
        contextQueries: {
          redeemablePolicies: (lmsUserId) => ({
            queryKey: [lmsUserId],
            queryFn: async ({ queryKey }) => fetchRedeemablePolicies(queryKey[2], lmsUserId),
          }),
        },
      },
      couponCodes: {
        queryKey: null,
        queryFn: async ({ queryKey }) => fetchCouponCodes(queryKey[2]),
      },
      offers: {
        queryKey: null,
        queryFn: async ({ queryKey }) => fetchEnterpriseOffers(queryKey[2]),
      },
    },
  }),
});
export default enterprise;
