import { SUBSIDY_TYPE } from '../../../../constants';
import { LICENSE_STATUS } from '../../../enterprise-user-subsidy/data/constants';
import { useBrowseAndRequestConfiguration } from './useBrowseAndRequest';
import useSubscriptions from './useSubscriptions';

export default function useHasValidLicenseOrSubscriptionRequestsEnabled() {
  const { data: { subscriptionLicense } } = useSubscriptions();
  const { data: browseAndRequestConfiguration } = useBrowseAndRequestConfiguration();
  const hasActivatedAndCurrentLicense = subscriptionLicense?.status === LICENSE_STATUS.ACTIVATED
      && subscriptionLicense?.subscriptionPlan?.isCurrent;
  const hasRequestsEnabledForSubscriptions = browseAndRequestConfiguration?.subsidyRequestsEnabled
  && browseAndRequestConfiguration.subsidyType === SUBSIDY_TYPE.LICENSE;
  return hasActivatedAndCurrentLicense || hasRequestsEnabledForSubscriptions;
}
