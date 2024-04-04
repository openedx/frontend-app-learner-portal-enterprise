import { useMemo } from 'react';

import { useBrowseAndRequestConfiguration } from './useBrowseAndRequest';
import useCouponCodes from './useCouponCodes';
import useSubscriptions from './useSubscriptions';
import { getCatalogsForSubsidyRequests } from '../utils';

/**
 * A custom hook that returns the catalogs that can be used for subsidy requests.
 *
 * @returns {Object} - An object containing the catalogs that can be used for subsidy requests.
 */
export default function useCatalogsForSubsidyRequest() {
  const { data: browseAndRequestConfiguration } = useBrowseAndRequestConfiguration();
  const { data: { customerAgreement } } = useSubscriptions();
  const { data: { couponsOverview } } = useCouponCodes();

  return useMemo(() => getCatalogsForSubsidyRequests({
    browseAndRequestConfiguration,
    couponsOverview,
    customerAgreement,
  }), [
    browseAndRequestConfiguration,
    couponsOverview,
    customerAgreement,
  ]);
}
