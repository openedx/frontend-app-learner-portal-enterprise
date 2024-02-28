/* eslint-disable no-underscore-dangle */
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
  fetchCouponCodeRequests,
} from '../components/app/routes/data/services';

import { getAvailableCourseRuns } from '../components/course/data/utils';
import { SUBSIDY_REQUEST_STATE } from '../components/enterprise-subsidy-requests';

export const enterprise = createQueryKeys('enterprise', {
  enterpriseCustomer: (enterpriseUuid) => ({
    queryKey: [enterpriseUuid],
    contextQueries: {
      contentHighlights: {
        queryKey: null,
        contextQueries: {
          configuration: {
            queryKey: null,
            queryFn: async ({ queryKey }) => fetchEnterpriseCuration(queryKey[2]),
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
          browseAndRequest: (userEmail) => ({
            queryKey: [userEmail],
            contextQueries: {
              configuration: {
                queryKey: null,
                queryFn: async ({ queryKey }) => fetchBrowseAndRequestConfiguration(queryKey[2], queryKey[4]),
              },
              requests: (state = SUBSIDY_REQUEST_STATE.REQUESTED) => ({
                queryKey: [state],
                contextQueries: {
                  licenseRequests: {
                    queryKey: null,
                    queryFn: async ({ queryKey }) => fetchLicenseRequests(queryKey[2], queryKey[4], queryKey[5]),
                  },
                  couponCodeRequests: {
                    queryKey: null,
                    queryFn: async ({ queryKey }) => fetchCouponCodeRequests(queryKey[2], queryKey[4], queryKey[5]),
                  },
                },
              }),
            },
          }),
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

export const user = createQueryKeys('user', {
  entitlements: {
    queryKey: null,
    queryFn: async () => fetchUserEntitlements(),
  },
});

export const queries = mergeQueryKeys(enterprise, user);
