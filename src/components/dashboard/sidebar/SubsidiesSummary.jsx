import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';

import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import classNames from 'classnames';
import CouponCodesSummaryCard from './CouponCodesSummaryCard';
import SubscriptionSummaryCard from './SubscriptionSummaryCard';
import LearnerCreditSummaryCard from './LearnerCreditSummaryCard';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { LICENSE_STATUS } from '../../enterprise-user-subsidy/data/constants';
import { CATALOG_ACCESS_CARD_BUTTON_TEXT } from './data/constants';
import SidebarCard from './SidebarCard';
import { CourseEnrollmentsContext } from '../main-content/course-enrollments/CourseEnrollmentsContextProvider';
import { SubsidyRequestsContext, SUBSIDY_TYPE } from '../../enterprise-subsidy-requests';
import { getOfferExpiringFirst, getPolicyExpiringFirst } from './utils';
import getActiveAssignments from '../data/utils';
import { POLICY_TYPES } from '../../enterprise-user-subsidy/enterprise-offers/data/constants';

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
    hasCurrentEnterpriseOffers,
    redeemableLearnerCreditPolicies,
  } = useContext(UserSubsidyContext);

  const learnerCreditSummaryCardData = getLearnerCreditSummaryCardData({
    enterpriseOffers,
    redeemableLearnerCreditPolicies,
  });

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
  const hasAvailableLearnerCreditPolicies = redeemableLearnerCreditPolicies?.redeemablePolicies.length > 0;

  const hasAvailableSubsidyOrRequests = (
    hasActiveLicenseOrLicenseRequest || hasAssignedCodesOrCodeRequests || learnerCreditSummaryCardData
  );
  const hasAutoAppliedLearnerCreditPolicies = (
    redeemableLearnerCreditPolicies?.filter(policy => policy.policyType !== POLICY_TYPES.ASSIGNED_CREDIT).length > 0
  );

  const [assignmentOnlyLearner, setAssignmentOnlyLearner] = useState(false);
  useEffect(() => {
    const assignmentsData = redeemableLearnerCreditPolicies?.flatMap(item => item?.learnerContentAssignments || []);
    const { hasActiveAssignments } = getActiveAssignments(assignmentsData);
    if (
      !hasActiveLicenseOrLicenseRequest
      && !hasAssignedCodesOrCodeRequests
      && !hasCurrentEnterpriseOffers
      && !hasAutoAppliedLearnerCreditPolicies
      && hasActiveAssignments
    ) {
      setAssignmentOnlyLearner(true);
    }
  }, [
    redeemableLearnerCreditPolicies,
    hasCurrentEnterpriseOffers,
    hasAssignedCodesOrCodeRequests,
    hasActiveLicenseOrLicenseRequest,
    hasAutoAppliedLearnerCreditPolicies,
  ]);

  if (!hasAvailableSubsidyOrRequests) {
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
  // TODO: Design debt, don't have cards in a card
    <SidebarCard
      cardSectionClassNames="border-0 shadow-none p-0"
      cardClassNames={classNames('mb-5', { 'col-8 border-0 shadow-none': programProgressPage })}
    >
      <div className={className} data-testid="subsidies-summary">
        {hasActiveLicenseOrLicenseRequest && (
          <SubscriptionSummaryCard
            subscriptionPlan={subscriptionPlan}
            licenseRequest={licenseRequests[0]}
            courseEndDate={courseEndDate}
            programProgressPage={programProgressPage}
            className="border-0 shadow-none"
          />
        )}
        {hasAssignedCodesOrCodeRequests && (
          <CouponCodesSummaryCard
            couponCodesCount={couponCodesCount}
            couponCodeRequestsCount={couponCodeRequests.length}
            totalCoursesEligibleForCertificate={totalCoursesEligibleForCertificate}
            programProgressPage={programProgressPage}
            className="border-0 shadow-none"
          />
        )}
        {(canEnrollWithEnterpriseOffers || hasAvailableLearnerCreditPolicies)
          && learnerCreditSummaryCardData?.expirationDate && (
          <LearnerCreditSummaryCard
            className="border-0 shadow-none"
            expirationDate={learnerCreditSummaryCardData.expirationDate}
          />
        )}
      </div>
      {(searchCoursesCta && !assignmentOnlyLearner) && (
        <SidebarCard
          cardClassNames="border-0 shadow-none"
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
