import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { ENTERPRISE_OFFER_STATUS, ENTERPRISE_OFFER_USAGE_TYPE } from './constants';

export function fetchEnterpriseOffers(enterpriseId, options = {
  usage_type: ENTERPRISE_OFFER_USAGE_TYPE.PERCENTAGE,
  discount_value: 100,
  status: ENTERPRISE_OFFER_STATUS.OPEN,
}) {
  const queryParams = new URLSearchParams({
    ...options,
  });
  const config = getConfig();
  const url = `${config.ECOMMERCE_BASE_URL}/api/v2/enterprise/${enterpriseId}/enterprise-learner-offers/?${queryParams.toString()}`;
  return getAuthenticatedHttpClient().get(url);
}
