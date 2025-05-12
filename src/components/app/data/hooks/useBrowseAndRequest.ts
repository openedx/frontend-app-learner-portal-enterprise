import { useContext, useMemo } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';

import {
  queryBrowseAndRequestConfiguration,
  queryCouponCodeRequests,
  queryLicenseRequests,
} from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';

type SubscriptionsQueryOptions<TData = unknown, TSelectData = TData> = {
  select?: (data: TData) => TSelectData;
};

type CouponCodesQueryOptions<TData = unknown, TSelectData = TData> = {
  select?: (data: TData) => TSelectData;
};

type UseBrowseAndRequestQueryOptions<
  TDataCodes = CouponCodeRequest[],
  TSelectDataCodes = TDataCodes,
  TDataSubscriptions = LicenseRequest[],
  TSelectDataSubscriptions = TDataSubscriptions,
> = {
  subscriptionLicensesQueryOptions?: SubscriptionsQueryOptions<TDataSubscriptions, TSelectDataSubscriptions>;
  couponCodesQueryOptions?: CouponCodesQueryOptions<TDataCodes, TSelectDataCodes>;
};

/**
 * Retrieves the browse and request configuration.
 * @returns The query results for the browse and request configuration.
 */
export function useBrowseAndRequestConfiguration() {
  const { data: enterpriseCustomer } = useEnterpriseCustomer<EnterpriseCustomer>();
  return useSuspenseQuery(
    queryOptions({
      ...queryBrowseAndRequestConfiguration(enterpriseCustomer.uuid),
    }),
  );
}

/**
 * Retrieves the subscription license requests.
 * @returns The query results for the subscription license requests.
 */
export function useSubscriptionLicenseRequests<TData = LicenseRequest[], TSelectData = TData>(
  options: SubscriptionsQueryOptions<TData, TSelectData> = {},
) {
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  const { data: enterpriseCustomer } = useEnterpriseCustomer<EnterpriseCustomer>();
  const { select } = options;
  return useSuspenseQuery(
    queryOptions({
      ...queryLicenseRequests(enterpriseCustomer.uuid, authenticatedUser.email),
      select: (data) => {
        if (select) {
          return select(data as TData);
        }
        return data;
      },
    }),
  );
}

/**
 * Retrieves the coupon code requests.
 * @returns The query results for the coupon code requests.
 */
export function useCouponCodeRequests<TData = CouponCodeRequest[], TSelectData = TData>(
  options: CouponCodesQueryOptions<TData, TSelectData> = {},
) {
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  const { data: enterpriseCustomer } = useEnterpriseCustomer<EnterpriseCustomer>();
  const { select } = options;
  return useSuspenseQuery(
    queryOptions({
      ...queryCouponCodeRequests(enterpriseCustomer.uuid, authenticatedUser.email),
      select: (data) => {
        if (select) {
          return select(data as TData);
        }
        return data;
      },
    }),
  );
}

/**
 * Retrieves all data related to BnR.
 */
export default function useBrowseAndRequest<
  TDataCodes = CouponCodeRequest[],
  TSelectDataCodes = TDataCodes,
  TDataSubscriptions = LicenseRequest[],
  TSelectDataSubscriptions = TDataSubscriptions,
>(
  options: UseBrowseAndRequestQueryOptions<
  TDataCodes,
  TSelectDataCodes,
  TDataSubscriptions,
  TSelectDataSubscriptions> = {},
) {
  const {
    subscriptionLicensesQueryOptions,
    couponCodesQueryOptions,
  } = options;
  const { data: configuration } = useBrowseAndRequestConfiguration();
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
