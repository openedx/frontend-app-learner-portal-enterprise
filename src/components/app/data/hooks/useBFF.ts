import { useLocation, useParams } from 'react-router-dom';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { logError } from '@edx/frontend-platform/logging';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { resolveBFFQuery } from '../queries';
import useEnterpriseFeatures from './useEnterpriseFeatures';

export interface UseBFFArgs {
  /* additional fields to pass into the matched BFF query function */
  bffQueryAdditionalParams?: Record<string, unknown>;
  /* queryOptions specifically for the matched BFF query call */
  bffQueryOptions?: Omit<UseQueryOptions, 'queryFn' | 'queryKey'>;
  /* if a route is not compatible with the BFF layer, this field
  allows you to pass a fallback query endpoint to call in lieu of
  an unmatched BFF query */
  fallbackQueryConfig?: Partial<UseQueryOptions> | null;
}

/**
 * Uses the current page route to determine which API call to make for the BFF, if any.
 */
export default function useBFF({
  bffQueryAdditionalParams = {},
  bffQueryOptions = {},
  fallbackQueryConfig = null,
}: UseBFFArgs) {
  const enterpriseCustomerQueryResult = useEnterpriseCustomer();
  const enterpriseCustomer = enterpriseCustomerQueryResult.data!;
  const { data: enterpriseFeatures } = useEnterpriseFeatures();
  const { enterpriseSlug } = useParams();
  const location = useLocation();

  // Determine the BFF query to use based on the current location
  const matchedBFFQuery = resolveBFFQuery(
    location.pathname,
    {
      enterpriseCustomerUuid: enterpriseCustomer.uuid,
      enterpriseFeatures,
    },
  );

  // Determine which query to call, the original hook or the new BFF
  let queryConfig: Partial<UseQueryOptions> = {};
  if (matchedBFFQuery) {
    queryConfig = {
      ...matchedBFFQuery({ enterpriseSlug, ...bffQueryAdditionalParams }),
      ...bffQueryOptions,
    };
  } else if (fallbackQueryConfig) {
    queryConfig = fallbackQueryConfig;
  } else {
    const err = new Error('No BFF query found for the current route and no fallback query provided');
    logError(err);
    throw err;
  }
  return useQuery(queryConfig);
}
