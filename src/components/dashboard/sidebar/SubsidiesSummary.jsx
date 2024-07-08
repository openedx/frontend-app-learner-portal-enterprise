import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import PropTypes from 'prop-types';
import { Button, Card } from '@openedx/paragon';
import classNames from 'classnames';
import CouponCodesSummaryCard from './CouponCodesSummaryCard';
import SubscriptionSummaryCard from './SubscriptionSummaryCard';
import LearnerCreditSummaryCard from './LearnerCreditSummaryCard';
import {
  useAcademies,
  useBrowseAndRequest,
  useCouponCodes,
  useEnterpriseCourseEnrollments,
  useEnterpriseCustomer,
  useEnterpriseOffers,
  useHasAvailableSubsidiesOrRequests,
  useIsAssignmentsOnlyLearner,
} from '../../app/data';
import { COURSE_STATUSES } from '../../../constants';
import { getStatusMetadata } from '../data/utils';
import useExpirationMetadata from '../../budget-expiry-notification/data/hooks/useExpirationMetadata';

const SearchCoursesCta = ({
  ctaButtonVariant,
  showSearchCoursesCta,
  isProgramProgressPage,
}) => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { data: academies } = useAcademies();
  const isOneAcademy = enterpriseCustomer?.enableOneAcademy;

  if (enterpriseCustomer.disableSearch || !showSearchCoursesCta || isProgramProgressPage) {
    return null;
  }

  const ctaLinkDestination = isOneAcademy && academies[0]?.uuid ? `academies/${academies[0]?.uuid}` : 'search';

  return (
    <Card.Section>
      <Button
        as={Link}
        to={`/${enterpriseCustomer.slug}/${ctaLinkDestination}`}
        variant={ctaButtonVariant}
        block
      >
        {isOneAcademy ? (
          <FormattedMessage
            id="enterprise.dashboard.sidebar.subsidy.go.to.academy.button"
            defaultMessage="Go to Academy"
            description="Button text for the go to academy button on the enterprise dashboard sidebar."
          />
        )
          : (
            <FormattedMessage
              id="enterprise.dashboard.sidebar.subsidy.find.course.button"
              defaultMessage="Find a course"
              description="Button text for the find a course button on the enterprise dashboard sidebar."
            />
          )}
      </Button>
    </Card.Section>
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
  const { data: { allEnrollmentsByStatus } } = useEnterpriseCourseEnrollments();
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
  const hasApplicableLearnerCredit = (
    enterpriseOffersData.canEnrollWithEnterpriseOffers || hasAvailableLearnerCreditPolicies
  ) && !!learnerCreditSummaryCardData.expirationDate;
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

  if (!hasAvailableSubsidyOrRequests) {
    return null;
  }

  return (
    <Card
      className={classNames('mb-5', { 'col-8 border-0 shadow-none': programProgressPage })}
    >
      <div className={className} data-testid="subsidies-summary">
        {hasActiveLicenseOrLicenseRequest && (
          <SubscriptionSummaryCard
            courseEndDate={courseEndDate}
            programProgressPage={programProgressPage}
          />
        )}
        {hasAssignedCodesOrCodeRequests && (
          <CouponCodesSummaryCard
            couponCodesCount={couponCodes.couponCodeRedemptionCount}
            couponCodeRequestsCount={requests.couponCodes.length}
            totalCoursesEligibleForCertificate={totalCoursesEligibleForCertificate}
            programProgressPage={programProgressPage}
          />
        )}
        {hasApplicableLearnerCredit && (
          <LearnerCreditSummaryCard
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
    </Card>
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
