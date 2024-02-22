// The keys that map to enterpriseQueryKeys that is used to define specific queries
// and used to specifically invalidate queries

export const queryKeys = {
  // Global key to all queries
  all: ['enterprise'],
  enterprise: (enterpriseUuid) => [...queryKeys.all, enterpriseUuid],
  enterpriseLearner: () => [...queryKeys.all, 'linked-enterprise-customer-users'],
  // Global learner configuration
  learnerConfiguration: (enterpriseUuid) => [...queryKeys.enterprise(enterpriseUuid), 'configuration'],
  // Configurations
  browseAndRequestConfiguration: (enterpriseUuid) => [...queryKeys.learnerConfiguration(enterpriseUuid), 'browse-and-request'],
  enterpriseCurationConfiguration: (enterpriseUuid) => [...queryKeys.learnerConfiguration(enterpriseUuid), 'content-highlights'],
  // All user subsidy related queries - subscriptions, policies, codes and offers
  allUserSubsidies: () => [...queryKeys.all, 'user-subsidy'],
  // Individual subsidy keys
  subscriptions: () => [...queryKeys.allUserSubsidies(), 'subscriptions'],
  policy: () => [...queryKeys.allUserSubsidies(), 'policy'],
  couponCodes: () => [...queryKeys.allUserSubsidies(), 'coupon-codes'],
  offers: () => [...queryKeys.allUserSubsidies(), 'enterprise-learner-offers'],
  // policy specific endpoints
  redeemablePolicies: () => [...queryKeys.policy(), 'redeemable-policies'],
};

// The queryKey for useQuery hook
export const enterpriseQueryKeys = {
  enterpriseLearner: (username, enterpriseSlug) => [
    ...queryKeys.enterpriseLearner(),
    username,
    enterpriseSlug,
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
