import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import SidebarCard from './SidebarCard';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';

export const OFFER_SUMMARY_TITLE = 'Assigned courses left to redeem';

const OfferSummaryCard = ({ className }) => {
  const { offers: { offersCount } } = useContext(UserSubsidyContext);
  if (offersCount > 0) {
    return (
      <SidebarCard
        title={OFFER_SUMMARY_TITLE}
        cardClassNames={className}
        textClassNames={offersCount ? 'big-number' : ''}
      >
        {offersCount}
      </SidebarCard>
    );
  }
  return null;
};

OfferSummaryCard.propTypes = {
  className: PropTypes.string,
};

OfferSummaryCard.defaultProps = {
  className: undefined,
};

export default OfferSummaryCard;
