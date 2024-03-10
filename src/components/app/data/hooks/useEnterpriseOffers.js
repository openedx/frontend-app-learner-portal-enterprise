import { useQuery } from '@tanstack/react-query';
import { queryEnterpriseLearnerOffers } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { transformEnterpriseOffer } from '../../../enterprise-user-subsidy/enterprise-offers/data/utils';

export default function useEnterpriseOffers() {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  return useQuery({
    ...queryEnterpriseLearnerOffers(enterpriseCustomer.uuid),
    select: (enterpriseOffers) => {
      const transformedEnterpriseOffers = enterpriseOffers.map(offer => transformEnterpriseOffer(offer));
      const currentEnterpriseOffers = transformedEnterpriseOffers.filter(offer => offer.isCurrent);
      return {
        enterpriseOffers: transformedEnterpriseOffers,
        currentEnterpriseOffers,
        canEnrollWithEnterpriseOffers: enterpriseOffers.length > 0,
        hasCurrentEnterpriseOffers: currentEnterpriseOffers.length > 0,
        hasLowEnterpriseOffersBalance: currentEnterpriseOffers.some(offer => offer.isLowOnBalance),
        hasNoEnterpriseOffersBalance: currentEnterpriseOffers.every(offer => offer.isOutOfBalance),
      };
    },
  });
}
