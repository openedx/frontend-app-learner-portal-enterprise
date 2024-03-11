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
  fetchAcademies,
} from '../services';

import { SUBSIDY_REQUEST_STATE } from '../../../../constants';

const enterprise = createQueryKeys('enterprise', {
  enterpriseCustomer: (enterpriseUuid) => ({
    queryKey: [enterpriseUuid],
    contextQueries: {
      academies: {
        queryKey: null,
        queryFn: async ({ queryKey }) => fetchAcademies(queryKey[2]),
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
      enrollments: {
        queryKey: null,
        queryFn: async ({ queryKey }) => fetchEnterpriseCourseEnrollments(queryKey[2]),
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
});

const queries = mergeQueryKeys(enterprise, user);
export default queries;
