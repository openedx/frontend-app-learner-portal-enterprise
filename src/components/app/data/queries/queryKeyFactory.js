import { createQueryKeys, mergeQueryKeys } from '@lukemorales/query-key-factory';

import {
  checkTransactionStatus,
  fetchAcademies,
  fetchAcademiesDetail,
  fetchBrowseAndRequestConfiguration,
  fetchCanRedeem,
  fetchContentHighlights,
  fetchCouponCodeRequests,
  fetchCouponCodes,
  fetchCourseMetadata,
  fetchCourseRecommendations,
  fetchCourseReviews,
  fetchCourseRunMetadata,
  fetchEnterpriseCourseEnrollments,
  fetchEnterpriseCuration,
  fetchEnterpriseCustomerContainsContent,
  fetchEnterpriseLearnerData,
  fetchEnterpriseOffers,
  fetchInProgressPathways,
  fetchLearnerProgramProgressDetail,
  fetchLearnerProgramsList,
  fetchLearnerSkillLevels,
  fetchLicenseRequests,
  fetchNotices,
  fetchPathwayProgressDetails,
  fetchProgramDetails,
  fetchRedeemablePolicies,
  fetchSubscriptions,
  fetchUserEntitlements,
  fetchVideoDetail,
} from '../services';

import { SUBSIDY_REQUEST_STATE } from '../../../../constants';

/**
 * A query key object that can be used to perform
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
          // queryAcademiesList
          list: {
            queryKey: null,
            queryFn: async ({ queryKey }) => fetchAcademies(queryKey[2]),
          },
        },
      },
      academy: {
        queryKey: null,
        contextQueries: {
          // queryAcademiesDetail
          detail: (academyUUID) => ({
            queryKey: [academyUUID],
            queryFn: async ({ queryKey }) => fetchAcademiesDetail(academyUUID, queryKey[2]),
          }),
        },
      },
      // queryContentHighlightsConfiguration
      contentHighlights: {
        queryKey: null,
        contextQueries: {
          configuration: {
            queryKey: null,
            queryFn: async ({ queryKey }) => fetchEnterpriseCuration(queryKey[2]),
          },
          // queryContentHighlightSets
          highlightSets: {
            queryKey: null,
            queryFn: async ({ queryKey }) => fetchContentHighlights(queryKey[2]),
          },
        },
      },
      course: (courseKey) => ({
        queryKey: [courseKey],
        contextQueries: {
          // queryCanRedeem, queryCanUpgradeWithLearnerCredit
          canRedeem: (availableCourseRunKeys) => ({
            queryKey: [availableCourseRunKeys],
            queryFn: async ({ queryKey }) => fetchCanRedeem(queryKey[2], availableCourseRunKeys),
          }),
          recommendations: (searchCatalogs) => ({
            queryKey: [searchCatalogs],
            queryFn: async ({ queryKey }) => fetchCourseRecommendations(queryKey[2], queryKey[4], searchCatalogs),
          }),
        },
      }),
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
          // queryEnterpriseProgram
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
              // queryBrowseAndRequestConfiguration
              configuration: {
                queryKey: null,
                queryFn: async ({ queryKey }) => fetchBrowseAndRequestConfiguration(queryKey[2]),
              },
              requests: (userEmail, state = SUBSIDY_REQUEST_STATE.REQUESTED) => ({
                queryKey: [userEmail, state],
                contextQueries: {
                  // queryLicenseRequests
                  licenseRequests: {
                    queryKey: null,
                    queryFn: async ({ queryKey }) => fetchLicenseRequests(queryKey[2], queryKey[6], queryKey[7]),
                  },
                  // queryCouponCodeRequests
                  couponCodeRequests: {
                    queryKey: null,
                    queryFn: async ({ queryKey }) => fetchCouponCodeRequests(queryKey[2], queryKey[5], queryKey[7]),
                  },
                },
              }),
            },
          },
          // queryCouponCodes
          couponCodes: {
            queryKey: null,
            queryFn: async ({ queryKey }) => fetchCouponCodes(queryKey[2]),
          },
          // queryEnterpriseLearnerOffers
          enterpriseOffers: {
            queryKey: null,
            queryFn: async ({ queryKey }) => fetchEnterpriseOffers(queryKey[2]),
          },
          policy: {
            queryKey: null,
            contextQueries: {
              // queryRedeemablePolicies
              redeemablePolicies: (lmsUserId) => ({
                queryKey: [lmsUserId],
                queryFn: async ({ queryKey }) => fetchRedeemablePolicies(queryKey[2], lmsUserId),
              }),
              // queryPolicyTransaction
              transaction: (transaction) => ({
                queryKey: [transaction],
                queryFn: async () => checkTransactionStatus(transaction),
              }),
            },
          },
          // querySubscriptions
          subscriptions: {
            queryKey: null,
            queryFn: async ({ queryKey }) => fetchSubscriptions(queryKey[2]),
          },
        },
      },
      video: {
        queryKey: null,
        contextQueries: {
          // queryVideoDetail
          detail: (videoUUID) => ({
            queryKey: [videoUUID],
            queryFn: async ({ queryKey }) => fetchVideoDetail(videoUUID, queryKey[2]),
          }),
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
  course: (courseKey) => ({
    queryKey: [courseKey],
    contextQueries: {
      metadata: (courseRunKey) => ({
        queryKey: [courseRunKey],
        queryFn: async ({ queryKey }) => fetchCourseMetadata(queryKey[2], queryKey[4]),
        contextQueries: {
          courseRun: {
            queryKey: null,
            queryFn: async ({ queryKey }) => fetchCourseRunMetadata(queryKey[4]),
          },
        },
      }),
      reviews: {
        queryKey: null,
        queryFn: async ({ queryKey }) => fetchCourseReviews(queryKey[2]),
      },
    },
  }),
  pathway: (pathwayUUID) => ({
    queryKey: [pathwayUUID],
    contextQueries: {
      // queryLearnerPathwayProgressData
      progress: {
        queryKey: null,
        queryFn: async ({ queryKey }) => fetchPathwayProgressDetails(queryKey[2]),
      },
    },
  }),
  program: (programUUID) => ({
    queryKey: [programUUID],
    contextQueries: {
      // queryLearnerProgramProgressData
      progress: {
        queryKey: null,
        queryFn: async ({ queryKey }) => fetchLearnerProgramProgressDetail(queryKey[2]),
      },
    },
  }),
});

const queries = mergeQueryKeys(enterprise, user, content);
export default queries;
