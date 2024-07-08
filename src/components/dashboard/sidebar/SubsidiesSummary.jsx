import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import PropTypes from 'prop-types';
import { Button, Card } from '@openedx/paragon';
import classNames from 'classnames';
import CardSection from '@openedx/paragon/src/Card/CardSection';
import dayjs from 'dayjs';
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
  useSubscriptions,
} from '../../app/data';
import { COURSE_STATUSES } from '../../../constants';
import { getStatusMetadata } from '../data/utils';
import useExpirationMetadata from '../../budget-expiry-notification/data/hooks/useExpirationMetadata';

const SearchCoursesCta = ({
  ctaButtonVariant,
  showSearchCoursesCta,
  isProgramProgressPage,
  disableSearch,
  slug,
  className,
}) => {
  if (disableSearch || !showSearchCoursesCta || isProgramProgressPage) {
    return null;
  }
  return (
    <CardSection className={className}>
      <Button
        as={Link}
        to={`/${slug}/search`}
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
  disableSearch: PropTypes.bool.isRequired,
  slug: PropTypes.string.isRequired,
  className: PropTypes.string,
};

SearchCoursesCta.defaultProps = {
  className: undefined,
};

const SubsidiesSummary = ({
  className,
  showSearchCoursesCta,
  totalCoursesEligibleForCertificate,
  courseEndDate,
  programProgressPage,
}) => {
  const { data: { allEnrollmentsByStatus } } = useEnterpriseCourseEnrollments();
  const { data: { disableExpiryMessagingForLearnerCredit, disableSearch, slug } } = useEnterpriseCustomer();
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
  const hasApplicableLearnerCredit = (
    enterpriseOffersData.canEnrollWithEnterpriseOffers || hasAvailableLearnerCreditPolicies
  ) && !!learnerCreditSummaryCardData.expirationDate;
  const isAssignmentOnlyLearner = useIsAssignmentsOnlyLearner();
  const { isPlanApproachingExpiry } = useExpirationMetadata(
    learnerCreditSummaryCardData?.expirationDate,
  );
  const { data: academies } = useAcademies();
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

  // Used to determine className for search course CTA
  // Since the disable expiration notifications for subscriptions and learner credit
  // hides expiration, we must account for the padding on the SearchCourseCTA.
  const searchCourseCTAClassNames = useMemo(() => {
    // Since there are no disable expiration flags for codes,
    // we check if they are not rendered only if one of the flags are enabled
    if (!hasAssignedCodesOrCodeRequests && (
      disableExpiryMessagingForLearnerCredit || !subscriptions.showExpirationNotifications
    )) {
      // If notifications for both learner credit and subscriptions are disabled, and they are both expired
      // We do not return a class name
      if (
        hasApplicableLearnerCredit && hasActiveLicenseOrLicenseRequest
          && !subscriptions.showExpirationNotifications
          && !subscriptions?.subscriptionPlan?.isCurrent
          && disableExpiryMessagingForLearnerCredit
          && dayjs(learnerCreditSummaryCardData?.expirationDate).isBefore(dayjs())
      ) {
        return undefined;
      }
      // If notifications are enabled for one type of subsidy but not the other and they are expired
      // We also render undefined
      if (
        hasActiveLicenseOrLicenseRequest && !hasApplicableLearnerCredit
          && !subscriptions?.showExpirationNotifications
          && !subscriptions?.subscriptionPlan?.isCurrent
      ) {
        return undefined;
      }
      if (
        hasApplicableLearnerCredit && !hasActiveLicenseOrLicenseRequest
          && disableExpiryMessagingForLearnerCredit
          && dayjs(learnerCreditSummaryCardData?.expirationDate).isBefore(dayjs())
      ) {
        return undefined;
      }
    }
    // Otherwise, we render the default CSS value
    return 'pt-0';
  }, [
    disableExpiryMessagingForLearnerCredit,
    hasActiveLicenseOrLicenseRequest,
    hasApplicableLearnerCredit,
    hasAssignedCodesOrCodeRequests,
    learnerCreditSummaryCardData?.expirationDate,
    subscriptions.showExpirationNotifications,
    subscriptions?.subscriptionPlan?.isCurrent,
  ]);

  if (!hasAvailableSubsidyOrRequests) {
    return null;
  }

  const isOneAcademy = enterpriseCustomer?.enableOneAcademy;
  const searchCoursesCta = (
    !programProgressPage && !enterpriseCustomer.disableSearch && showSearchCoursesCta && (
      <Button
        as={Link}
        to={(isOneAcademy && academies?.[0]?.uuid)
          ? `/${enterpriseCustomer.slug}/academies/${academies[0].uuid}`
          : `/${enterpriseCustomer.slug}/search`}
        variant={ctaButtonVariant}
        block
      >
        {
          isOneAcademy ? (
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
            )
        }
      </Button>
    )
  );

  return (
    <Card
      className={classNames('mb-5', { 'col-8 border-0 shadow-none': programProgressPage })}
    >
      <div className={className} data-testid="subsidies-summary">
        {hasActiveLicenseOrLicenseRequest && (
          <SubscriptionSummaryCard
            subscriptionPlan={subscriptions.subscriptionPlan}
            showExpirationNotifications={subscriptions.showExpirationNotifications}
            licenseRequest={requests.subscriptionLicenses[0]}
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
            className="border-0 shadow-none"
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
          disableSearch={disableSearch}
          slug={slug}
          className={searchCourseCTAClassNames}
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
