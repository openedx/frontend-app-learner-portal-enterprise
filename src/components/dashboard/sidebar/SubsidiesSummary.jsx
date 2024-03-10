import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import classNames from 'classnames';
import CouponCodesSummaryCard from './CouponCodesSummaryCard';
import SubscriptionSummaryCard from './SubscriptionSummaryCard';
import LearnerCreditSummaryCard from './LearnerCreditSummaryCard';
import { LICENSE_STATUS } from '../../enterprise-user-subsidy/data/constants';
import SidebarCard from './SidebarCard';
import { getOfferExpiringFirst, getPolicyExpiringFirst } from './utils';
import {
  useBrowseAndRequest,
  useCouponCodes,
  useEnterpriseCourseEnrollments,
  useEnterpriseCustomer,
  useEnterpriseOffers,
  useIsAssignmentsOnlyLearner,
  useRedeemablePolicies,
  useSubscriptions,
} from '../../app/data';
import { COURSE_STATUSES } from '../../../constants';

function getLearnerCreditSummaryCardData({ enterpriseOffers, redeemableLearnerCreditPolicies }) {
  const learnerCreditPolicyExpiringFirst = getPolicyExpiringFirst(redeemableLearnerCreditPolicies?.redeemablePolicies);
  const enterpriseOfferExpiringFirst = getOfferExpiringFirst(enterpriseOffers);

  if (!learnerCreditPolicyExpiringFirst && !enterpriseOfferExpiringFirst) {
    return undefined;
  }

  return {
    expirationDate: (
      learnerCreditPolicyExpiringFirst?.subsidyExpirationDate || enterpriseOfferExpiringFirst?.endDatetime
    ),
  };
}

const SubsidiesSummary = ({
  className,
  showSearchCoursesCta,
  totalCoursesEligibleForCertificate,
  courseEndDate,
  programProgressPage,
}) => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { data: { allEnrollmentsByStatus } } = useEnterpriseCourseEnrollments();

  const { data: subscriptions } = useSubscriptions();
  const { data: couponCodes } = useCouponCodes();
  const { data: enterpriseOffersData } = useEnterpriseOffers();
  const { data: redeemableLearnerCreditPolicies } = useRedeemablePolicies();
  const { data: { requests } } = useBrowseAndRequest();

  const isAssignmentOnlyLearner = useIsAssignmentsOnlyLearner();

  const learnerCreditSummaryCardData = getLearnerCreditSummaryCardData({
    enterpriseOffers: enterpriseOffersData.enterpriseOffers,
    redeemableLearnerCreditPolicies,
  });

  // const { requestsBySubsidyType } = useContext(SubsidyRequestsContext);

  // if there are course enrollments, the cta button below will be the only one on the page
  const ctaButtonVariant = useMemo(() => {
    const hasCourseEnrollments = Object.entries(allEnrollmentsByStatus)
      .map(([enrollmentStatus, enrollmentsForStatus]) => {
        if (enrollmentStatus === COURSE_STATUSES.assigned) {
          return enrollmentsForStatus.assignmentsForDisplay;
        }
        return enrollmentsForStatus;
      })
      .flat().length > 0;
    return hasCourseEnrollments ? 'primary' : 'outline-primary';
  }, [allEnrollmentsByStatus]);

  const hasActiveLicenseOrLicenseRequest = (
    subscriptions.subscriptionLicense?.status === LICENSE_STATUS.ACTIVATED
    || requests.subscriptionLicenses.length > 0
  );

  const hasAssignedCodesOrCodeRequests = (
    couponCodes.couponCodeAssignments.length > 0
    || requests.couponCodes.length > 0
  );
  const hasAvailableLearnerCreditPolicies = redeemableLearnerCreditPolicies?.redeemablePolicies.length > 0;

  const hasAvailableSubsidyOrRequests = (
    hasActiveLicenseOrLicenseRequest || hasAssignedCodesOrCodeRequests || learnerCreditSummaryCardData
  );

  if (!hasAvailableSubsidyOrRequests) {
    return null;
  }

  const searchCoursesCta = (
    !programProgressPage && !enterpriseCustomer.disableSearch && showSearchCoursesCta && (
      <Button
        as={Link}
        to={`/${enterpriseCustomer.slug}/search`}
        variant={ctaButtonVariant}
        block
      >
        <FormattedMessage
          id="enterprise.dashboard.sidebar.subsidy.find.course.button"
          defaultMessage="Find a course"
          description="Button text for the find a course button on the enterprise dashboard sidebar."
        />
      </Button>
    )
  );

  return (
    // TODO: Design debt, don't have cards in a card
    <SidebarCard
      cardSectionClassNames="border-0 shadow-none p-0"
      cardClassNames={classNames('mb-5', { 'col-8 border-0 shadow-none': programProgressPage })}
    >
      <div className={className} data-testid="subsidies-summary">
        {hasActiveLicenseOrLicenseRequest && (
          <SubscriptionSummaryCard
            subscriptionPlan={subscriptions.subscriptionPlan}
            licenseRequest={requests.subscriptionLicenses[0]}
            courseEndDate={courseEndDate}
            programProgressPage={programProgressPage}
            className="border-0 shadow-none"
          />
        )}
        {hasAssignedCodesOrCodeRequests && (
          <CouponCodesSummaryCard
            couponCodesCount={couponCodes.couponCodeAssignments.length}
            couponCodeRequestsCount={requests.couponCodes.length}
            totalCoursesEligibleForCertificate={totalCoursesEligibleForCertificate}
            programProgressPage={programProgressPage}
            className="border-0 shadow-none"
          />
        )}
        {(enterpriseOffersData.canEnrollWithEnterpriseOffers || hasAvailableLearnerCreditPolicies)
          && learnerCreditSummaryCardData?.expirationDate && (
          <LearnerCreditSummaryCard
            className="border-0 shadow-none"
            expirationDate={learnerCreditSummaryCardData.expirationDate}
            assignmentOnlyLearner={isAssignmentOnlyLearner}
          />
        )}
      </div>
      {(searchCoursesCta && !isAssignmentOnlyLearner) && (
        <SidebarCard
          cardClassNames="border-0 shadow-none"
          cardSectionClassNames="pt-0"
        >
          {searchCoursesCta}
        </SidebarCard>
      )}
    </SidebarCard>
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
