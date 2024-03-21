import { useQuery } from '@tanstack/react-query';
import { queryEnterpriseLearnerOffers } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { transformEnterpriseOffer } from '../../../enterprise-user-subsidy/enterprise-offers/data/utils';

export default function useEnterpriseOffers(queryOptions = {}) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { select, ...queryOptionsRest } = queryOptions;
  return useQuery({
    ...queryEnterpriseLearnerOffers(enterpriseCustomer.uuid),
    queryOptionsRest,
    select: (data) => {
      if (select) {
        return select(data);
      }
      const transformedEnterpriseOffers = data.map(offer => transformEnterpriseOffer(offer));
      const currentEnterpriseOffers = transformedEnterpriseOffers.filter(offer => offer.isCurrent);

      return {
        enterpriseOffers: transformedEnterpriseOffers,
        currentEnterpriseOffers,
        // Note: canEnrollWithEnterpriseOffers should be true even if there are no current offers.
        canEnrollWithEnterpriseOffers: data.length > 0,
        hasCurrentEnterpriseOffers: currentEnterpriseOffers.length > 0,
        hasLowEnterpriseOffersBalance: currentEnterpriseOffers.some(offer => offer.isLowOnBalance),
        hasNoEnterpriseOffersBalance: currentEnterpriseOffers.every(offer => offer.isOutOfBalance),
      };
    },
  });
}
