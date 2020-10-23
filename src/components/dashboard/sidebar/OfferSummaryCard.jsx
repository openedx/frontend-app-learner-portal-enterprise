import React, { useContext } from 'react';

import SidebarCard from './SidebarCard';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';

export const OFFER_SUMMARY_TITLE = 'Assigned courses left to redeem';

const OfferSideboardCard = () => {
  const { offers: { offersCount } } = useContext(UserSubsidyContext);
  if (offersCount > 0) {
    return (
      <SidebarCard
        title={OFFER_SUMMARY_TITLE}
        textClassNames={offersCount ? 'big-number' : ''}
      >
        {offersCount}
      </SidebarCard>
    );
  }
  return null;
};

export default OfferSideboardCard;
