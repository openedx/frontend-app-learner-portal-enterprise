import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Badge } from '@edx/paragon';

import SidebarCard from './SidebarCard';
import {
  OFFER_SUMMARY_TITLE,
  OFFER_SUMMARY_NOTICE,
  OFFERS_AVAILABLE_BADGE_VARIANT,
  OFFERS_AVAILABLE_BADGE_LABEL,
  COUPON_CODES_REQUESTED_BADGE_VARIANT,
  COUPON_CODES_REQUESTED_BADGE_LABEL,
} from './data/constants';

const OfferSummaryCard = ({ offersCount, couponCodeRequestsCount, className }) => {
  const badgeVariantAndLabel = useMemo(() => {
    if (offersCount > 0) {
      return ({
        variant: OFFERS_AVAILABLE_BADGE_VARIANT,
        label: OFFERS_AVAILABLE_BADGE_LABEL,
      });
    }

    if (couponCodeRequestsCount > 0) {
      return ({
        variant: COUPON_CODES_REQUESTED_BADGE_VARIANT,
        label: COUPON_CODES_REQUESTED_BADGE_LABEL,
      });
    }

    return null;
  }, [offersCount, couponCodeRequestsCount]);

  if (!(offersCount || couponCodeRequestsCount)) {
    return null;
  }

  return (
    <SidebarCard
      title={(
        <div className="d-flex align-items-start justify-content-between">
          {`${OFFER_SUMMARY_TITLE}${offersCount > 0 ? `: ${offersCount}` : ''}`}
          {badgeVariantAndLabel && (
            <Badge
              variant={badgeVariantAndLabel.variant}
              className="ml-2"
              data-testid="subscription-status-badge"
            >
              {badgeVariantAndLabel.label}
            </Badge>
          )}
        </div>
      )}
      cardClassNames={className}
    >
      <p className="m-0">
        {OFFER_SUMMARY_NOTICE}
      </p>
    </SidebarCard>
  );
};

OfferSummaryCard.propTypes = {
  offersCount: PropTypes.number,
  couponCodeRequestsCount: PropTypes.number,
  className: PropTypes.string,
};

OfferSummaryCard.defaultProps = {
  offersCount: 0,
  couponCodeRequestsCount: 0,
  className: undefined,
};

export default OfferSummaryCard;
