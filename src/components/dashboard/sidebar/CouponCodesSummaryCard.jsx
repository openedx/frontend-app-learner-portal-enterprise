import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Badge, useToggle } from '@openedx/paragon';
import { WarningFilled } from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import CardHeader from '@openedx/paragon/src/Card/CardHeader';
import CardSection from '@openedx/paragon/src/Card/CardSection';
import CouponCodesWarningModal from '../../program-progress/CouponCodesWarningModal';
import { COUPON_CODES_AVAILABLE_BADGE_VARIANT, COUPON_CODES_REQUESTED_BADGE_VARIANT } from './data/constants';

const CouponCodesSummaryCard = ({
  couponCodesCount, couponCodeRequestsCount, totalCoursesEligibleForCertificate, programProgressPage,
}) => {
  const [
    isCouponCodeWarningModalOpen,
    couponCodeWarningModalOpen,
    onCouponCodeWarningModalClose,
  ] = useToggle(false);
  const intl = useIntl();
  const badgeVariantAndLabel = useMemo(() => {
    if (couponCodesCount > 0) {
      return ({
        variant: COUPON_CODES_AVAILABLE_BADGE_VARIANT,
        label: intl.formatMessage({
          id: 'enterprise.dashboard.sidebar.coupon.codes.active.badge.label',
          defaultMessage: 'Active',
          description: 'Coupon codes active badge label on the enterprise dashboard sidebar.',
        }),
      });
    }

    if (couponCodeRequestsCount > 0) {
      return ({
        variant: COUPON_CODES_REQUESTED_BADGE_VARIANT,
        label: intl.formatMessage({
          id: 'enterprise.dashboard.sidebar.coupon.codes.requested.badge.label',
          defaultMessage: 'Requested',
          description: 'Coupon codes requested badge label on the enterprise dashboard sidebar.',
        }),
      });
    }

    return null;
  }, [couponCodesCount, couponCodeRequestsCount, intl]);

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
        <CardHeader
          title={(
            <div className="d-flex align-items-start justify-content-between">
              <h3>
                <FormattedMessage
                  id="enterprise.dashboard.sidebar.coupon.codes.summary.remaining.codes"
                  defaultMessage="Remaining Codes"
                  description="Remaining coupon codes summary on the enterprise dashboard sidebar."
                />
              </h3>
              {totalCoursesEligibleForCertificate > couponCodesCount && (
                <WarningFilled
                  className="ml-2"
                  onClick={() => { couponCodeWarningModalOpen(); }}
                />
              )}
            </div>
          )}
        />
        <CardSection>
          <p className="m-0">
            <h3 className="float-left"> {couponCodesCount > 0 ? couponCodesCount : 0}</h3>{' '}
            <span className="ml-2">
              <FormattedMessage
                id="enterprise.dashboard.sidebar.coupon.codes.summary.detail"
                defaultMessage="Codes remaining, contact your administrator for additional codes."
                description="Remaining coupon codes and contact administrator advice on the enterprise dashboard sidebar."
              />
            </span>
          </p>
        </CardSection>
      </>
    );
  }

  return (
    <>
      <CardHeader
        title={(
          <div className="d-flex align-items-start justify-content-between">
            <div>{`${intl.formatMessage({
              id: 'enterprise.dashboard.sidebar.coupon.codes.summary.title',
              defaultMessage: 'Enrollment Codes',
              description: 'Title for the coupon codes summary on the enterprise dashboard sidebar.',
            })}${couponCodesCount > 0 ? `: ${couponCodesCount}` : ''}`}
            </div>
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
      />
      <CardSection>
        <p className="m-0">
          <FormattedMessage
            id="enterprise.dashboard.sidebar.coupon-codes.summary.notice"
            defaultMessage="Use codes to enroll in courses from your catalog."
            description="Notice for the enrollment coupon codes on the enterprise dashboard sidebar."
          />
        </p>
      </CardSection>
    </>
  );
};

CouponCodesSummaryCard.propTypes = {
  couponCodesCount: PropTypes.number,
  totalCoursesEligibleForCertificate: PropTypes.number,
  couponCodeRequestsCount: PropTypes.number,
  programProgressPage: PropTypes.bool,
};

CouponCodesSummaryCard.defaultProps = {
  couponCodesCount: 0,
  totalCoursesEligibleForCertificate: 0,
  couponCodeRequestsCount: 0,
  programProgressPage: false,
};

export default CouponCodesSummaryCard;
