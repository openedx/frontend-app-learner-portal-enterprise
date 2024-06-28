import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import classNames from 'classnames';
import CardSection from '@openedx/paragon/src/Card/CardSection';
import CouponCodesSummaryCard from './CouponCodesSummaryCard';
import SubscriptionSummaryCard from './SubscriptionSummaryCard';
import LearnerCreditSummaryCard from './LearnerCreditSummaryCard';
import SidebarCard from './SidebarCard';
import {
  useBrowseAndRequest,
  useCouponCodes,
  useEnterpriseCourseEnrollments,
  useEnterpriseCustomer,
  useEnterpriseOffers,
  useHasAvailableSubsidiesOrRequests,
  useIsAssignmentsOnlyLearner,
  useSubscriptions,
} from '../../app/data';
import { COURSE_STATUSES } from '../../../constants';
import { getStatusMetadata } from '../data/utils';
import useExpirationMetadata from '../../budget-expiry-notification/data/hooks/useExpirationMetadata';

const SearchCoursesCta = ({ ctaButtonVariant, showSearchCoursesCta, isProgramProgressPage }) => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { disableSearch } = enterpriseCustomer;
  if (disableSearch && !showSearchCoursesCta && !isProgramProgressPage) {
    return null;
  }
  return (
    <CardSection className="pt-0">
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
    </CardSection>
  );
};

SearchCoursesCta.propTypes = {
  ctaButtonVariant: PropTypes.string.isRequired,
  showSearchCoursesCta: PropTypes.bool.isRequired,
  isProgramProgressPage: PropTypes.bool.isRequired,
};

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
  const { data: { requests } } = useBrowseAndRequest();
  const {
    hasAvailableSubsidyOrRequests,
    hasAvailableLearnerCreditPolicies,
    hasAssignedCodesOrCodeRequests,
    hasActiveLicenseOrLicenseRequest,
    learnerCreditSummaryCardData,
  } = useHasAvailableSubsidiesOrRequests();
  const isAssignmentOnlyLearner = useIsAssignmentsOnlyLearner();
  const { isPlanApproachingExpiry } = useExpirationMetadata(
    learnerCreditSummaryCardData?.expirationDate,
  );

  const learnerCreditStatusMetadata = getStatusMetadata({
    isPlanApproachingExpiry,
    endDateStr: learnerCreditSummaryCardData?.expirationDate,
  });

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

  const hasApplicableLearnerCredit = (
    enterpriseOffersData.canEnrollWithEnterpriseOffers || hasAvailableLearnerCreditPolicies
  ) && learnerCreditSummaryCardData.expirationDate;

  const hasAnApplicableSummaryCard = (
    hasApplicableLearnerCredit && hasActiveLicenseOrLicenseRequest && hasAssignedCodesOrCodeRequests
  );

  if (!hasAvailableSubsidyOrRequests && !hasAnApplicableSummaryCard) {
    return null;
  }

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
            showExpirationNotifications={subscriptions.showExpirationNotifications}
            licenseRequest={requests.subscriptionLicenses[0]}
            courseEndDate={courseEndDate}
            programProgressPage={programProgressPage}
            className="border-0 shadow-none"
          />
        )}
        {hasAssignedCodesOrCodeRequests && (
          <CouponCodesSummaryCard
            couponCodesCount={couponCodes.couponCodeRedemptionCount}
            couponCodeRequestsCount={requests.couponCodes.length}
            totalCoursesEligibleForCertificate={totalCoursesEligibleForCertificate}
            programProgressPage={programProgressPage}
            className="border-0 shadow-none"
          />
        )}
        {hasApplicableLearnerCredit && (
          <LearnerCreditSummaryCard
            className="border-0 shadow-none"
            expirationDate={learnerCreditSummaryCardData.expirationDate}
            assignmentOnlyLearner={isAssignmentOnlyLearner}
            statusMetadata={learnerCreditStatusMetadata}
          />
        )}
      </div>
      {!isAssignmentOnlyLearner && (
        <SearchCoursesCta
          ctaButtonVariant={ctaButtonVariant}
          isProgramProgressPage={programProgressPage}
          showSearchCoursesCta={showSearchCoursesCta}
        />
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
