import { AppContext } from '@edx/frontend-platform/react';
import { useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { queryBrowseAndRequestConfiguration, queryCouponCodeRequests, queryLicenseRequests } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';

/**
 * Retrieves the browse and request configuration.
 * @param {Types.UseQueryOptions} queryOptions - The query options.
 * @returns {Types.UseQueryResult} The query results for the browse and request configuration.
 */
export function useBrowseAndRequestConfiguration(queryOptions = {}) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  return useQuery({
    ...queryBrowseAndRequestConfiguration(enterpriseCustomer.uuid),
    ...queryOptions,
  });
}

/**
 * Retrieves the subscription license requests.
 * @param {Types.UseQueryOptions} queryOptions - The query options.
 * @returns {Types.UseQueryResult} The query results for the subscription license requests.
 */
export function useSubscriptionLicenseRequests(queryOptions = {}) {
  const { authenticatedUser } = useContext(AppContext);
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  return useQuery({
    ...queryLicenseRequests(enterpriseCustomer.uuid, authenticatedUser.email),
    ...queryOptions,
  });
}

/**
 * Retrieves the coupon code requests.
 * @param {Types.UseQueryOptions} queryOptions - The query options.
 * @returns {Types.UseQueryResult} The query results for the coupon code requests.
 */
export function useCouponCodeRequests(queryOptions = {}) {
  const { authenticatedUser } = useContext(AppContext);
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  return useQuery({
    ...queryCouponCodeRequests(enterpriseCustomer.uuid, authenticatedUser.email),
    ...queryOptions,
  });
}

/**
 * Retrieves all data related to BnR.
 * @param {Types.UseQueryOptions} queryOptions - The query options.
 * @returns {Types.UseQueryResult} The query results for browse and request.
 */
export default function useBrowseAndRequest(queryOptions = {}) {
  const {
    configurationQueryOptions,
    subscriptionLicensesQueryOptions,
    couponCodesQueryOptions,
  } = queryOptions;
  const { data: configuration } = useBrowseAndRequestConfiguration(configurationQueryOptions);
  const { data: subscriptionLicenses } = useSubscriptionLicenseRequests(subscriptionLicensesQueryOptions);
  const { data: couponCodes } = useCouponCodeRequests(couponCodesQueryOptions);

  return useMemo(
    () => ({
      data: {
        configuration,
        requests: {
          subscriptionLicenses,
          couponCodes,
        },
      },
    }),
    [configuration, subscriptionLicenses, couponCodes],
  );
}
