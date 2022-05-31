import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';

import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import CouponCodesSummaryCard from './CouponCodesSummaryCard';
import SubscriptionSummaryCard from './SubscriptionSummaryCard';
import EnterpriseOffersSummaryCard from './EnterpriseOffersSummaryCard';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { LICENSE_STATUS } from '../../enterprise-user-subsidy/data/constants';
import { CATALOG_ACCESS_CARD_BUTTON_TEXT } from './data/constants';
import SidebarCard from './SidebarCard';
import { CourseEnrollmentsContext } from '../main-content/course-enrollments/CourseEnrollmentsContextProvider';
import { SubsidyRequestsContext, SUBSIDY_TYPE } from '../../enterprise-subsidy-requests';

const SubsidiesSummary = ({
  className, showSearchCoursesCta, totalCoursesEligibleForCertificate, courseEndDate, programProgressPage,
}) => {
  const {
    enterpriseConfig: {
      slug,
      disableSearch,
    },
  } = useContext(AppContext);

  const {
    courseEnrollmentsByStatus,
  } = useContext(CourseEnrollmentsContext);

  const {
    subscriptionPlan,
    subscriptionLicense: userSubscriptionLicense,
    couponCodes: { couponCodesCount },
    enterpriseOffers,
    canEnrollWithEnterpriseOffers,
  } = useContext(UserSubsidyContext);

  const {
    requestsBySubsidyType,
  } = useContext(SubsidyRequestsContext);

  // if there are course enrollments, the cta button below will be the only one on the page
  const ctaButtonVariant = useMemo(
    () => (Object.values(courseEnrollmentsByStatus).flat().length > 0 ? 'primary' : 'outline-primary'),
    [courseEnrollmentsByStatus],
  );

  const licenseRequests = requestsBySubsidyType[SUBSIDY_TYPE.LICENSE];
  const couponCodeRequests = requestsBySubsidyType[SUBSIDY_TYPE.COUPON];

  const hasActiveLicenseOrLicenseRequest = (subscriptionPlan
    && userSubscriptionLicense?.status === LICENSE_STATUS.ACTIVATED) || licenseRequests.length > 0;

  const hasAssignedCodesOrCodeRequests = couponCodesCount > 0 || couponCodeRequests.length > 0;

  const hasAssignedSubsidyOrRequests = hasActiveLicenseOrLicenseRequest || hasAssignedCodesOrCodeRequests;

  // We will not allow enterprises to use enterprise offers together with license/coupon codes for now
  const hasRedeemableEnterpriseOffers = enterpriseOffers.length > 0 && canEnrollWithEnterpriseOffers;

  if (!(hasAssignedSubsidyOrRequests || hasRedeemableEnterpriseOffers)) {
    return null;
  }

  const searchCoursesCta = (
    !programProgressPage && !disableSearch && showSearchCoursesCta && (
      <Button
        as={Link}
        to={`/${slug}/search`}
        variant={ctaButtonVariant}
        block
      >
        {CATALOG_ACCESS_CARD_BUTTON_TEXT}
      </Button>
    )
  );

  return (
    <>
      {hasAssignedSubsidyOrRequests && (
        // TODO: Design debt, don't have cards in a card
        <SidebarCard
          cardSectionClassNames={
            `${programProgressPage && 'border-remove'}`
          }
          cardClassNames={
            `mb-5 ${programProgressPage ? 'col-8 border-remove'
              : 'border-primary border-brand-primary catalog-access-card'}`
          }
        >
          <div className={className} data-testid="subsidies-summary">
            {hasActiveLicenseOrLicenseRequest && (
              <SubscriptionSummaryCard
                subscriptionPlan={subscriptionPlan}
                licenseRequest={licenseRequests[0]}
                courseEndDate={courseEndDate}
                programProgressPage={programProgressPage}
                className="mb-3"
              />
            )}
            {hasAssignedCodesOrCodeRequests && (
              <CouponCodesSummaryCard
                couponCodesCount={couponCodesCount}
                couponCodeRequestsCount={couponCodeRequests.length}
                totalCoursesEligibleForCertificate={totalCoursesEligibleForCertificate}
                programProgressPage={programProgressPage}
                className="mb-3"
              />
            )}
            {searchCoursesCta}
          </div>
        </SidebarCard>
      )}
      {hasRedeemableEnterpriseOffers && <EnterpriseOffersSummaryCard className="mb-5" searchCoursesCta={searchCoursesCta} />}
    </>
  );
};

SubsidiesSummary.propTypes = {
  totalCoursesEligibleForCertificate: PropTypes.number,
  courseEndDate: PropTypes.string,
  className: PropTypes.string,
  showSearchCoursesCta: PropTypes.bool,
  programProgressPage: PropTypes.bool,
};

SubsidiesSummary.defaultProps = {
  totalCoursesEligibleForCertificate: 0,
  courseEndDate: undefined,
  className: undefined,
  showSearchCoursesCta: true,
  programProgressPage: false,
};

export default SubsidiesSummary;
