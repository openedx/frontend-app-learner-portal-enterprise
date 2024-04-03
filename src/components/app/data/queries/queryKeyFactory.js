import { createQueryKeys, mergeQueryKeys } from '@lukemorales/query-key-factory';

import {
  fetchCourseMetadata,
  fetchUserEntitlements,
  fetchCanRedeem,
  fetchEnterpriseLearnerData,
  fetchEnterpriseCourseEnrollments,
  fetchBrowseAndRequestConfiguration,
  fetchLicenseRequests,
  fetchRedeemablePolicies,
  fetchSubscriptions,
  fetchCouponCodes,
  fetchEnterpriseOffers,
  fetchEnterpriseCuration,
  fetchContentHighlights,
  fetchCouponCodeRequests,
  fetchNotices,
  fetchLearnerProgramsList,
  fetchInProgressPathways,
  fetchLearnerSkillLevels,
  fetchAcademies,
  fetchProgramDetails,
  fetchLearnerProgramProgressDetail,
  fetchEnterpriseCustomerContainsContent, fetchAcademiesDetail,
} from '../services';

import { SUBSIDY_REQUEST_STATE } from '../../../../constants';

/**
 * A query key object that can be used to performs
 * API calls using React Query.
 *
 * See the following links for more information:
 *
 * {@link https://github.com/lukemorales/query-key-factory},
 *
 * {@link https://tanstack.com/query/v4/docs/framework/react/community/lukemorales-query-key-factory}
 * @type {QueryKeyFactoryResult<"enterprise", QueryFactorySchema>}
 */
const enterprise = createQueryKeys('enterprise', {
  enterpriseCustomer: (enterpriseUuid) => ({
    queryKey: [enterpriseUuid],
    contextQueries: {
      academies: {
        queryKey: null,
        contextQueries: {
          list: {
            queryKey: null,
            queryFn: async ({ queryKey }) => fetchAcademies(queryKey[2]),
          },
        },
      },
      contentHighlights: {
        queryKey: null,
        contextQueries: {
          configuration: {
            queryKey: null,
            queryFn: async ({ queryKey }) => fetchEnterpriseCuration(queryKey[2]),
          },
          highlightSets: {
            queryKey: null,
            queryFn: async ({ queryKey }) => fetchContentHighlights(queryKey[2]),
          },
        },
      },
      course: {
        queryKey: null,
        contextQueries: {
          contentMetadata: (courseKey) => ({
            queryKey: [courseKey],
            queryFn: async ({ queryKey }) => fetchCourseMetadata(queryKey[2], courseKey),
          }),
          canRedeem: (availableCourseRunKeys) => ({
            queryKey: [availableCourseRunKeys],
            queryFn: async ({ queryKey }) => fetchCanRedeem(queryKey[2], availableCourseRunKeys),
          }),
        },
      },
      containsContent: (contentIdentifiers) => ({
        queryKey: [contentIdentifiers],
        queryFn: async ({ queryKey }) => fetchEnterpriseCustomerContainsContent(queryKey[2], contentIdentifiers),
      }),
      enrollments: {
        queryKey: null,
        queryFn: async ({ queryKey }) => fetchEnterpriseCourseEnrollments(queryKey[2]),
      },
      programs: {
        queryKey: null,
        queryFn: async ({ queryKey }) => fetchLearnerProgramsList(queryKey[2]),
        contextQueries: {
          detail: (programUUID) => ({
            queryKey: [programUUID],
            queryFn: async ({ queryKey }) => fetchProgramDetails(queryKey[2], programUUID),
          }),
        },
      },
      pathways: {
        queryKey: null,
        queryFn: async ({ queryKey }) => fetchInProgressPathways(queryKey[2]),
      },
      subsidies: {
        queryKey: null,
        contextQueries: {
          browseAndRequest: {
            queryKey: null,
            contextQueries: {
              configuration: {
                queryKey: null,
                queryFn: async ({ queryKey }) => fetchBrowseAndRequestConfiguration(queryKey[2]),
              },
              requests: (userEmail, state = SUBSIDY_REQUEST_STATE.REQUESTED) => ({
                queryKey: [userEmail, state],
                contextQueries: {
                  licenseRequests: {
                    queryKey: null,
                    queryFn: async ({ queryKey }) => fetchLicenseRequests(queryKey[2], queryKey[5], queryKey[7]),
                  },
                  couponCodeRequests: {
                    queryKey: null,
                    queryFn: async ({ queryKey }) => fetchCouponCodeRequests(queryKey[2], queryKey[5], queryKey[7]),
                  },
                },
              }),
            },
          },
          couponCodes: {
            queryKey: null,
            queryFn: async ({ queryKey }) => fetchCouponCodes(queryKey[2]),
          },
          enterpriseOffers: {
            queryKey: null,
            queryFn: async ({ queryKey }) => fetchEnterpriseOffers(queryKey[2]),
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
          subscriptions: {
            queryKey: null,
            queryFn: async ({ queryKey }) => fetchSubscriptions(queryKey[2]),
          },
        },
      },
    },
  }),
  enterpriseLearner: (username, enterpriseSlug) => ({
    queryKey: [username, enterpriseSlug],
    queryFn: async () => fetchEnterpriseLearnerData(username, enterpriseSlug),
  }),
});

const user = createQueryKeys('user', {
  entitlements: {
    queryKey: null,
    queryFn: async () => fetchUserEntitlements(),
  },
  notices: {
    queryKey: null,
    queryFn: async () => fetchNotices(),
  },
  skillLevels: (jobId) => ({
    queryKey: [jobId],
    queryFn: async ({ queryKey }) => fetchLearnerSkillLevels(queryKey[2]),
  }),
});

const content = createQueryKeys('content', {
  academy: {
    queryKey: null,
    contextQueries: {
      detail: (academyUUID) => ({
        queryKey: [academyUUID],
        queryFn: () => fetchAcademiesDetail(academyUUID),
      }),
    },
  },
  program: (programUUID) => ({
    queryKey: [programUUID],
    contextQueries: {
      progress: {
        queryKey: null,
        queryFn: async ({ queryKey }) => fetchLearnerProgramProgressDetail(queryKey[2]),
      },
    },
  }),
});

const queries = mergeQueryKeys(enterprise, user, content);
export default queries;
