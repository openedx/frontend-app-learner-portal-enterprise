import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Badge, useToggle } from '@openedx/paragon';
import { WarningFilled } from '@openedx/paragon/icons';

import SidebarCard from './SidebarCard';
import {
  COUPON_CODES_SUMMARY_TITLE,
  COUPON_CODES_SUMMARY_REMAINING_CODES,
  COUPON_CODES_SUMMARY_NOTICE,
  COUPON_CODES_SUMMARY_DETAIL,
  COUPON_CODES_AVAILABLE_BADGE_VARIANT,
  COUPON_CODES_AVAILABLE_BADGE_LABEL,
  COUPON_CODES_REQUESTED_BADGE_VARIANT,
  COUPON_CODES_REQUESTED_BADGE_LABEL,
} from './data/constants';
import CouponCodesWarningModal from '../../program-progress/CouponCodesWarningModal';

const CouponCodesSummaryCard = ({
  couponCodesCount, couponCodeRequestsCount, className, totalCoursesEligibleForCertificate, programProgressPage,
}) => {
  const [
    isCouponCodeWarningModalOpen,
    couponCodeWarningModalOpen,
    onCouponCodeWarningModalClose,
  ] = useToggle(false);

  const badgeVariantAndLabel = useMemo(() => {
    if (couponCodesCount > 0) {
      return ({
        variant: COUPON_CODES_AVAILABLE_BADGE_VARIANT,
        label: COUPON_CODES_AVAILABLE_BADGE_LABEL,
      });
    }

    if (couponCodeRequestsCount > 0) {
      return ({
        variant: COUPON_CODES_REQUESTED_BADGE_VARIANT,
        label: COUPON_CODES_REQUESTED_BADGE_LABEL,
      });
    }

    return null;
  }, [couponCodesCount, couponCodeRequestsCount]);

  if (!(couponCodesCount || couponCodeRequestsCount)) {
    return null;
  }

  if (programProgressPage) {
    return (
      <>
        <CouponCodesWarningModal
          isCouponCodeWarningModalOpen={isCouponCodeWarningModalOpen}
          onCouponCodeWarningModalClose={onCouponCodeWarningModalClose}
          couponCodesCount={couponCodesCount}
        />
        <SidebarCard
          title={(
            <div className="d-flex align-items-start justify-content-between">
              <h3>{COUPON_CODES_SUMMARY_REMAINING_CODES}</h3>
              {totalCoursesEligibleForCertificate > couponCodesCount && (
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
            <h3 className="float-left"> {couponCodesCount > 0 ? couponCodesCount : 0}</h3>{' '}<span className="ml-2">{COUPON_CODES_SUMMARY_DETAIL}</span>
          </p>
        </SidebarCard>
      </>
    );
  }

  return (
    <SidebarCard
      title={(
        <div className="d-flex align-items-start justify-content-between">
          <div>{`${COUPON_CODES_SUMMARY_TITLE}${couponCodesCount > 0 ? `: ${couponCodesCount}` : ''}`}</div>
          <div>
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
        </div>
      )}
      cardClassNames={className}
    >
      <p className="m-0">
        {COUPON_CODES_SUMMARY_NOTICE}
      </p>
    </SidebarCard>
  );
};

CouponCodesSummaryCard.propTypes = {
  couponCodesCount: PropTypes.number,
  totalCoursesEligibleForCertificate: PropTypes.number,
  couponCodeRequestsCount: PropTypes.number,
  className: PropTypes.string,
  programProgressPage: PropTypes.bool,
};

CouponCodesSummaryCard.defaultProps = {
  couponCodesCount: 0,
  totalCoursesEligibleForCertificate: 0,
  couponCodeRequestsCount: 0,
  className: undefined,
  programProgressPage: false,
};

export default CouponCodesSummaryCard;
