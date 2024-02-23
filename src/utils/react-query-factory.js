// The keys that map to enterpriseQueryKeys that is used to define specific queries
// and used to specifically invalidate queries
export const queryKeys = {
  // Global key to all queries
  all: ['enterprise'],
  enterprise: (enterpriseUuid) => [...queryKeys.all, enterpriseUuid],
  entitlements: ['user', 'entitlements'],
  enterpriseLearner: () => [...queryKeys.all, 'linked-enterprise-customer-users'],
  enterpriseCourseEnrollments: (enterpriseUuid) => [...queryKeys.enterprise(enterpriseUuid), 'enrollments'],
  enterpriseCourseMetadata: (enterpriseUuid) => [...queryKeys.enterprise(enterpriseUuid), 'course'],
  canRedeem: (enterpriseUuid) => [...queryKeys.enterpriseCourseMetadata(enterpriseUuid), 'can-redeem'],
  // By feature prepended by enterpriseUuid
  enterpriseCuration: (enterpriseUuid) => [...queryKeys.enterprise(enterpriseUuid), 'content-highlights'],
  enterpriseCurationConfiguration: (enterpriseUuid) => [...queryKeys.enterprise(enterpriseUuid), 'configuration'],
  // All user subsidy related queries - subscriptions, policies, codes and offers
  allEnterpriseCustomerUserSubsidies: () => [...queryKeys.all, 'user-subsidy'],
  // Subsidy specific keys
  subscriptions: () => [...queryKeys.allEnterpriseCustomerUserSubsidies(), 'subscriptions'],
  policy: () => [...queryKeys.allEnterpriseCustomerUserSubsidies(), 'policy'],
  couponCodes: () => [...queryKeys.allEnterpriseCustomerUserSubsidies(), 'coupon-codes'],
  offers: () => [...queryKeys.allEnterpriseCustomerUserSubsidies(), 'enterprise-learner-offers'],
  browseAndRequest: () => [...queryKeys.allEnterpriseCustomerUserSubsidies(), 'browse-and-request'],
  // policy specific endpoints
  redeemablePolicies: () => [...queryKeys.policy(), 'redeemable-policies'],
  // browse and request endpoints
  browseAndRequestConfiguration: (enterpriseUuid) => [...queryKeys.browseAndRequest(), enterpriseUuid, 'configuration'],
};

// The queryKey for useQuery hook
export const enterpriseQueryKeys = {
  entitlements: queryKeys.entitlements,
  enterpriseLearner: (username, enterpriseSlug) => [
    ...queryKeys.enterpriseLearner(),
    username,
    enterpriseSlug,
  ],
  enterpriseCourseEnrollments: (enterpriseUuid) => [
    ...queryKeys.enterpriseCourseEnrollments(enterpriseUuid),
  ],
  enterpriseCourseMetadata: (enterpriseUuid, courseKey) => [
    ...queryKeys.enterpriseCourseMetadata(enterpriseUuid),
    courseKey,
  ],
  canRedeem: (enterpriseUuid, availableCourseRunKeys) => [
    ...queryKeys.canRedeem(enterpriseUuid),
    availableCourseRunKeys,
  ],
  browseAndRequestConfiguration: (enterpriseUuid, userEmail) => [
    ...queryKeys.browseAndRequestConfiguration(enterpriseUuid),
    userEmail,
  ],
  enterpriseCurationConfiguration: (enterpriseUuid) => [
    ...queryKeys.enterpriseCurationConfiguration((enterpriseUuid)),
  ],
  subscriptions: (enterpriseUuid) => [
    ...queryKeys.subscriptions(),
    enterpriseUuid,
  ],
  redeemablePolicies: (enterpriseUuid, lmsUserId) => [
    ...queryKeys.redeemablePolicies(),
    enterpriseUuid,
    lmsUserId,
  ],
  couponCodes: (enterpriseUuid) => [
    ...queryKeys.couponCodes(),
    enterpriseUuid,
  ],
  offers: (enterpriseUuid) => [
    ...queryKeys.offers(),
    enterpriseUuid,
  ],
};
