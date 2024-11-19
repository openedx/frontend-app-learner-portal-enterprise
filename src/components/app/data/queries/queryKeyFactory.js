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
  fetchEnterpriseLearnerDashboard,
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
 * {@link https://tanstack.com/query/v4/docs/framework/react/community/lukemorales-query-key-factory}
 */
const enterprise = createQueryKeys('enterprise', {
  enterpriseCustomer: (enterpriseUuid) => ({
    queryKey: [enterpriseUuid],
    contextQueries: {
      enterpriseSlug: (enterpriseSlug) => ({
        queryKey: [enterpriseSlug],
        contextQueries: {
          bffs: {
            queryKey: null,
            contextQueries: {
              dashboard: ({
                queryKey: null,
                queryFn: ({ queryKey }) => fetchEnterpriseLearnerDashboard(queryKey[2], queryKey[4]),
              }),
            },
          },
        },
      }),
      academies: {
        queryKey: null,
        contextQueries: {
          // queryAcademiesList
          list: {
            queryKey: null,
            queryFn: ({ queryKey }) => fetchAcademies(queryKey[2]),
          },
        },
      },
      academy: {
        queryKey: null,
        contextQueries: {
          // queryAcademiesDetail
          detail: (academyUUID) => ({
            queryKey: [academyUUID],
            queryFn: ({ queryKey }) => fetchAcademiesDetail(academyUUID, queryKey[2]),
          }),
        },
      },
      bffs: {
        queryKey: null,
        contextQueries: {
          dashboard: ({
            queryKey: null,
            queryFn: ({ queryKey }) => fetchEnterpriseLearnerDashboard(queryKey[2]),
          }),
        },
      },
      // queryContentHighlightsConfiguration
      contentHighlights: {
        queryKey: null,
        contextQueries: {
          configuration: {
            queryKey: null,
            queryFn: ({ queryKey }) => fetchEnterpriseCuration(queryKey[2]),
          },
          // queryContentHighlightSets
          highlightSets: {
            queryKey: null,
            queryFn: ({ queryKey }) => fetchContentHighlights(queryKey[2]),
          },
        },
      },
      course: (courseKey) => ({
        queryKey: [courseKey],
        contextQueries: {
          // queryCanRedeem, queryCanUpgradeWithLearnerCredit
          canRedeem: (availableCourseRunKeys) => ({
            queryKey: [availableCourseRunKeys],
            queryFn: ({ queryKey }) => fetchCanRedeem(queryKey[2], availableCourseRunKeys),
          }),
          recommendations: (searchCatalogs) => ({
            queryKey: [searchCatalogs],
            queryFn: ({ queryKey }) => fetchCourseRecommendations(queryKey[2], queryKey[4], searchCatalogs),
          }),
        },
      }),
      containsContent: (contentIdentifiers) => ({
        queryKey: [contentIdentifiers],
        queryFn: ({ queryKey }) => fetchEnterpriseCustomerContainsContent(queryKey[2], contentIdentifiers),
      }),
      enrollments: {
        queryKey: null,
        queryFn: ({ queryKey }) => fetchEnterpriseCourseEnrollments(queryKey[2]),
      },
      programs: {
        queryKey: null,
        queryFn: ({ queryKey }) => fetchLearnerProgramsList(queryKey[2]),
        contextQueries: {
          // queryEnterpriseProgram
          detail: (programUUID) => ({
            queryKey: [programUUID],
            queryFn: ({ queryKey }) => fetchProgramDetails(queryKey[2], programUUID),
          }),
        },
      },
      pathways: {
        queryKey: null,
        queryFn: ({ queryKey }) => fetchInProgressPathways(queryKey[2]),
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
                queryFn: ({ queryKey }) => fetchBrowseAndRequestConfiguration(queryKey[2]),
              },
              requests: (userEmail, state = SUBSIDY_REQUEST_STATE.REQUESTED) => ({
                queryKey: [userEmail, state],
                contextQueries: {
                  // queryLicenseRequests
                  licenseRequests: {
                    queryKey: null,
                    queryFn: ({ queryKey }) => fetchLicenseRequests(queryKey[2], queryKey[6], queryKey[7]),
                  },
                  // queryCouponCodeRequests
                  couponCodeRequests: {
                    queryKey: null,
                    queryFn: ({ queryKey }) => fetchCouponCodeRequests(queryKey[2], queryKey[5], queryKey[7]),
                  },
                },
              }),
            },
          },
          // queryCouponCodes
          couponCodes: {
            queryKey: null,
            queryFn: ({ queryKey }) => fetchCouponCodes(queryKey[2]),
          },
          // queryEnterpriseLearnerOffers
          enterpriseOffers: {
            queryKey: null,
            queryFn: ({ queryKey }) => fetchEnterpriseOffers(queryKey[2]),
          },
          policy: {
            queryKey: null,
            contextQueries: {
              // queryRedeemablePolicies
              redeemablePolicies: (lmsUserId) => ({
                queryKey: [lmsUserId],
                queryFn: ({ queryKey }) => fetchRedeemablePolicies(queryKey[2], lmsUserId),
              }),
              // queryPolicyTransaction
              transaction: (transaction) => ({
                queryKey: [transaction],
                queryFn: () => checkTransactionStatus(transaction),
              }),
            },
          },
          // querySubscriptions
          subscriptions: {
            queryKey: null,
            queryFn: ({ queryKey }) => fetchSubscriptions(queryKey[2]),
          },
        },
      },
      video: {
        queryKey: null,
        contextQueries: {
          // queryVideoDetail
          detail: (videoUUID) => ({
            queryKey: [videoUUID],
            queryFn: ({ queryKey }) => fetchVideoDetail(videoUUID, queryKey[2]),
          }),
        },
      },
    },
  }),
  enterpriseLearner: (username, enterpriseSlug) => ({
    queryKey: [username, enterpriseSlug],
    queryFn: () => fetchEnterpriseLearnerData(username, enterpriseSlug),
  }),
});

const user = createQueryKeys('user', {
  entitlements: {
    queryKey: null,
    queryFn: () => fetchUserEntitlements(),
  },
  notices: {
    queryKey: null,
    queryFn: () => fetchNotices(),
  },
  skillLevels: (jobId) => ({
    queryKey: [jobId],
    queryFn: ({ queryKey }) => fetchLearnerSkillLevels(queryKey[2]),
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
        queryFn: ({ queryKey }) => fetchCourseMetadata(queryKey[2], queryKey[4]),
        contextQueries: {
          courseRun: {
            queryKey: null,
            queryFn: ({ queryKey }) => fetchCourseRunMetadata(queryKey[4]),
          },
        },
      }),
      reviews: {
        queryKey: null,
        queryFn: ({ queryKey }) => fetchCourseReviews(queryKey[2]),
      },
    },
  }),
  pathway: (pathwayUUID) => ({
    queryKey: [pathwayUUID],
    contextQueries: {
      // queryLearnerPathwayProgressData
      progress: {
        queryKey: null,
        queryFn: ({ queryKey }) => fetchPathwayProgressDetails(queryKey[2]),
      },
    },
  }),
  program: (programUUID) => ({
    queryKey: [programUUID],
    contextQueries: {
      // queryLearnerProgramProgressData
      progress: {
        queryKey: null,
        queryFn: ({ queryKey }) => fetchLearnerProgramProgressDetail(queryKey[2]),
      },
    },
  }),
});

const queries = mergeQueryKeys(enterprise, user, content);
export default queries;
