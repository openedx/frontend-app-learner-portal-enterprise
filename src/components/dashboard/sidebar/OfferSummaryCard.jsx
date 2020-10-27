import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import SidebarCard from './SidebarCard';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';

export const OFFER_SUMMARY_TITLE = 'Additional Courses';

const OfferSummaryCard = ({ className }) => {
  const renderCardBody = (offersCount) => (
    <>
      <div className="text-center font-weight-bold h2">
        {offersCount}
      </div>
      <p>
        Your company has purchased additional courses for you to access to enhance your subscription.
      </p>
    </>
  );
  const { offers: { offersCount } } = useContext(UserSubsidyContext);
  if (offersCount > 0) {
    return (
      <SidebarCard
        title={OFFER_SUMMARY_TITLE}
        cardClassNames={className}
      >
        {renderCardBody(offersCount)}
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
