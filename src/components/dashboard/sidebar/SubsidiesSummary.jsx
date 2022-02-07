import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';

import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import OfferSummaryCard from './OfferSummaryCard';
import SubscriptionSummaryCard from './SubscriptionSummaryCard';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { LICENSE_STATUS } from '../../enterprise-user-subsidy/data/constants';
import { CATALOG_ACCESS_CARD_BUTTON_TEXT } from './data/constants';
import SidebarCard from './SidebarCard';
import { CourseEnrollmentsContext } from '../main-content/course-enrollments/CourseEnrollmentsContextProvider';
import { SubsidyRequestsContext } from '../../enterprise-subsidy-requests';
import { SUBSIDY_REQUEST_STATE } from '../../enterprise-subsidy-requests/constants';

const SubsidiesSummary = ({ className, showSearchCoursesCta }) => {
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
    offers: { offersCount },
  } = useContext(UserSubsidyContext);

  const {
    couponCodeRequests,
    licenseRequests,
  } = useContext(SubsidyRequestsContext);

  // if there are course enrollments, the cta button below will be the only one on the page
  const ctaButtonVariant = useMemo(
    () => (Object.values(courseEnrollmentsByStatus).flat().length > 0 ? 'primary' : 'outline-primary'),
    [courseEnrollmentsByStatus],
  );

  const pendingCouponCodeRequests = useMemo(() => couponCodeRequests.filter(
    request => request.state === SUBSIDY_REQUEST_STATE.REQUESTED,
  ), [couponCodeRequests.length]);

  const pendingLicenseRequest = useMemo(() => licenseRequests.find(
    request => request.state === SUBSIDY_REQUEST_STATE.REQUESTED,
  ), [licenseRequests.length]);

  const hasActiveLicenseOrLicenseRequest = (subscriptionPlan
    && userSubscriptionLicense?.status === LICENSE_STATUS.ACTIVATED) || !!pendingLicenseRequest;

  const hasOffersOrCouponCodeRequests = offersCount > 0 || pendingCouponCodeRequests.length > 0;

  if (!(hasActiveLicenseOrLicenseRequest || hasOffersOrCouponCodeRequests)) {
    return null;
  }

  return (
    <SidebarCard cardClassNames="border-primary border-brand-primary catalog-access-card mb-5">
      <div className={className} data-testid="subsidies-summary">
        {hasActiveLicenseOrLicenseRequest && (
          <SubscriptionSummaryCard
            subscriptionPlan={subscriptionPlan}
            licenseRequest={pendingLicenseRequest}
            className="mb-3"
          />
        )}
        {hasOffersOrCouponCodeRequests && (
          <OfferSummaryCard
            offersCount={offersCount}
            couponCodeRequestsCount={pendingCouponCodeRequests.length}
            className="mb-3"
          />
        )}
        {!disableSearch && showSearchCoursesCta && (
          <Button
            as={Link}
            to={`/${slug}/search`}
            variant={ctaButtonVariant}
            block
          >
            {CATALOG_ACCESS_CARD_BUTTON_TEXT}
          </Button>
        )}
      </div>
    </SidebarCard>
  );
};

SubsidiesSummary.propTypes = {
  className: PropTypes.string,
  showSearchCoursesCta: PropTypes.bool,
};

SubsidiesSummary.defaultProps = {
  className: undefined,
  showSearchCoursesCta: true,
};

export default SubsidiesSummary;
