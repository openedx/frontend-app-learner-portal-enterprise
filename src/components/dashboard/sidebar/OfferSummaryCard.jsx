import React from 'react';
import PropTypes from 'prop-types';

import SidebarCard from './SidebarCard';
import { OFFER_SUMMARY_TITLE, OFFER_SUMMARY_NOTICE } from './data/constants';

const OfferSummaryCard = ({ offersCount, className }) => {
  const renderCardBody = () => (
    <>
      <div className="h1 text-center">
        {offersCount}
      </div>
      <p className="m-0">
        {OFFER_SUMMARY_NOTICE}
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
