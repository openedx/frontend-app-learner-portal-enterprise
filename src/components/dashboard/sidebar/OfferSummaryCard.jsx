import React from 'react';
import PropTypes from 'prop-types';

import SidebarCard from './SidebarCard';
import { OFFER_SUMMARY_TITLE } from './data/constants';

const OfferSummaryCard = ({ offersCount, className }) => {
  const renderCardBody = () => (
    <>
      <div className="text-center font-weight-bold h2">
        {offersCount}
      </div>
      <p>
        Your company has purchased additional courses for you to access to enhance your subscription.
      </p>
    </>
  );

  return (
    <SidebarCard
      title={OFFER_SUMMARY_TITLE}
      cardClassNames={className}
    >
      {renderCardBody(offersCount)}
    </SidebarCard>
  );
};

OfferSummaryCard.propTypes = {
  offersCount: PropTypes.number.isRequired,
  className: PropTypes.string,
};

OfferSummaryCard.defaultProps = {
  className: undefined,
};

export default OfferSummaryCard;
