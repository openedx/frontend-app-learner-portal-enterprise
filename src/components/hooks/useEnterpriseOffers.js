import { useQuery } from '@tanstack/react-query';
import { queryEnterpriseLearnerOffers } from '../app/data';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { transformEnterpriseOffer } from '../enterprise-user-subsidy/enterprise-offers/data/utils';

export default function useEnterpriseOffers() {
  const { uuid } = useEnterpriseCustomer();
  const { data: enterpriseOffersData } = useQuery(queryEnterpriseLearnerOffers(uuid));
  const enterpriseOffers = enterpriseOffersData.results.map(offer => transformEnterpriseOffer(offer));

  const currentEntOffers = enterpriseOffers.filter(offer => offer.isCurrent);

  return {
    enterpriseOffers: enterpriseOffersData.results.map(offer => transformEnterpriseOffer(offer)),
    currentEnterpriseOffers: currentEntOffers,
    canEnrollWithEnterpriseOffers: enterpriseOffers.length > 0,
    hasCurrentEnterpriseOffers: currentEntOffers.length > 0,
    hasLowEnterpriseOffersBalance: currentEntOffers.some(offer => offer.isLowOnBalance),
    hasNoEnterpriseOffersBalance: currentEntOffers.every(offer => offer.isOutOfBalance),
  };
}
