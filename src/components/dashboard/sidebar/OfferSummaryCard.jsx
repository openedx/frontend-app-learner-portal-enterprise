import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Badge, useToggle } from '@edx/paragon';
import { WarningFilled } from '@edx/paragon/icons';

import SidebarCard from './SidebarCard';
import {
  OFFER_SUMMARY_TITLE,
  OFFER_REMAINING_CODES,
  OFFER_SUMMARY_NOTICE,
  OFFER_SUMMARY_DETAIL,
  OFFERS_AVAILABLE_BADGE_VARIANT,
  OFFERS_AVAILABLE_BADGE_LABEL,
  COUPON_CODES_REQUESTED_BADGE_VARIANT,
  COUPON_CODES_REQUESTED_BADGE_LABEL,
} from './data/constants';
import CouponCodesWarningModal from '../../program-progress/CouponCodesWarningModal';

const OfferSummaryCard = ({
  offersCount, couponCodeRequestsCount, className, totalCoursesEligibleForCertificate, programProgressPage,
}) => {
  const [
    isCouponCodeWarningModalOpen,
    couponCodeWarningModalOpen,
    onCouponCodeWarningModalClose,
  ] = useToggle(false);

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
    <>
      {programProgressPage ? (
        <>
          <CouponCodesWarningModal
            isCouponCodeWarningModalOpen={isCouponCodeWarningModalOpen}
            onCouponCodeWarningModalClose={onCouponCodeWarningModalClose}
            offersCount={offersCount}
          />

          <SidebarCard
            title={(
              <div className="d-flex align-items-start justify-content-between">
                <h3>{OFFER_REMAINING_CODES}</h3>
                {totalCoursesEligibleForCertificate > offersCount && (
                  <WarningFilled
                    className="ml-2"
                    onClick={() => { couponCodeWarningModalOpen(); }}
                  />
                )}
              </div>
            )}
            cardClassNames={className}
          >
            <p className="m-0">
              <h3 className="float-left"> {offersCount > 0 ? offersCount : 0}</h3>{' '}<span className="ml-2">{OFFER_SUMMARY_DETAIL}</span>
            </p>
          </SidebarCard>
        </>
      )
        : (
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
        )}
    </>
  );
};

OfferSummaryCard.propTypes = {
  offersCount: PropTypes.number,
  totalCoursesEligibleForCertificate: PropTypes.number,
  couponCodeRequestsCount: PropTypes.number,
  className: PropTypes.string,
  programProgressPage: PropTypes.bool,
};

OfferSummaryCard.defaultProps = {
  offersCount: 0,
  totalCoursesEligibleForCertificate: 0,
  couponCodeRequestsCount: 0,
  className: undefined,
  programProgressPage: false,
};

export default OfferSummaryCard;
