import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { ENTERPRISE_OFFER_STATUS, ENTERPRISE_OFFER_USAGE_TYPE } from '../../../../enterprise-user-subsidy/enterprise-offers/data/constants';
import { enterpriseQueryKeys } from "../../../../../utils/react-query-factory";

async function fetchEnterpriseOffers(enterpriseId, options = {}) {
  const queryParams = new URLSearchParams({
    usage_type: ENTERPRISE_OFFER_USAGE_TYPE.PERCENTAGE,
    discount_value: 100,
    status: ENTERPRISE_OFFER_STATUS.OPEN,
    page_size: 100,
    ...options,
  });
  const config = getConfig();
  const url = `${config.ECOMMERCE_BASE_URL}/api/v2/enterprise/${enterpriseId}/enterprise-learner-offers/?${queryParams.toString()}`;
  const response = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(response.data);
}

export function makeEnterpriseLearnerOffersQuery(enterpriseUuid) {
  return {
    queryKey: enterpriseQueryKeys.offers(enterpriseUuid),
    queryFn: async () => fetchEnterpriseOffers(enterpriseUuid),
    enabled: !!enterpriseUuid,
  };
}
