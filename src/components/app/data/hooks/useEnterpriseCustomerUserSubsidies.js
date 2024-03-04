import { useContext } from 'react';
import { useQueries } from '@tanstack/react-query';
import { AppContext } from '@edx/frontend-platform/react';

import useEnterpriseLearner from './useEnterpriseLearner';
import {
  queryCouponCodes,
  querySubscriptions,
  queryRedeemablePolicies,
  queryEnterpriseLearnerOffers,
  queryBrowseAndRequestConfiguration,
  queryLicenseRequests,
  queryCouponCodeRequests,
} from '../../routes/data/queries';
/**
 * Retrieves the subsidies present for the active enterprise customer user.
 * @returns {Types.UseQueryResult}} The query results for the enterprise customer user subsidies.
 */
export default function useEnterpriseCustomerUserSubsidies() {
  const { authenticatedUser } = useContext(AppContext);
  const { userId, email } = authenticatedUser;
  const { data: { enterpriseCustomer } } = useEnterpriseLearner();
  const enterpriseId = enterpriseCustomer.uuid;
  const queries = useQueries({
    queries: [
      querySubscriptions(enterpriseId),
      queryRedeemablePolicies({
        enterpriseUuid: enterpriseId,
        lmsUserId: userId,
      }),
      queryCouponCodes(enterpriseId),
      queryEnterpriseLearnerOffers(enterpriseId),
      queryBrowseAndRequestConfiguration(enterpriseId),
      queryLicenseRequests(enterpriseId, email),
      queryCouponCodeRequests(enterpriseId, email),
    ],
  });
  return {
    data: {
      subscriptions: queries[0].data,
      redeemablePolicies: queries[1].data,
      couponCodes: queries[2].data,
      enterpriseLearnerOffers: queries[3].data,
      browseAndRequest: {
        subsidyRequestConfiguration: queries[4].data,
        licenseRequests: queries[5].data,
        couponCodeRequests: queries[6].data,
      },
    },
  };
}
