import { useParams } from 'react-router-dom';
import { Card, CardGrid } from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform';

import CourseRunCard from './CourseRunCard';
import DeprecatedCourseRunCard from './deprecated/CourseRunCard';
import { useUserSubsidyApplicableToCourse } from '../data';
import {
  LEARNER_CREDIT_SUBSIDY_TYPE,
  useCourseMetadata,
  useEnterpriseCourseEnrollments,
  useEnterpriseCustomerContainsContentSuspense,
  useUserEntitlements,
} from '../../app/data';

/**
 * Displays a grid of `CourseRunCard` components, where each `CourseRunCard` represents
 * an available/enrollable course run.
 */
const CourseRunCards = () => {
  const { courseKey } = useParams();
  const {
    isPending: isPendingUserSubsidyApplicableToCourse,
    userSubsidyApplicableToCourse,
    missingUserSubsidyReason,
  } = useUserSubsidyApplicableToCourse();
  const { data: courseMetadata } = useCourseMetadata();
  const { data: { catalogList } } = useEnterpriseCustomerContainsContentSuspense([courseKey]);
  const { data: { enterpriseCourseEnrollments } } = useEnterpriseCourseEnrollments();
  const { data: userEntitlements } = useUserEntitlements();
  // The DEPRECATED CourseRunCard should be used when the applicable subsidy is NOT Learner Credit.
  const hasRedeemablePolicy = userSubsidyApplicableToCourse?.subsidyType === LEARNER_CREDIT_SUBSIDY_TYPE;
  const shouldUseDeprecatedCourseRunCard = !hasRedeemablePolicy && !missingUserSubsidyReason?.userMessage;
  // courseMetadata.avaialbleCourseRuns may include runs that are restricted from the applicable
  // subsidy, so instead we ask userSubsidyApplicableToCourse to give us exactly which runs to
  // display on this page. If there's no applicable subsidy for the course, fallback to just
  // displaying unrestricted runs.
  const runsAvailableToSubsidy = userSubsidyApplicableToCourse?.availableCourseRuns;
  const unrestrictedRunsOnly = courseMetadata.availableCourseRuns.filter(run => !run.restrictionType);
  const courseRunsToDisplay = (
    getConfig().FEATURE_ENABLE_RESTRICTED_RUNS && runsAvailableToSubsidy
  ) || unrestrictedRunsOnly;

  return (
    <CardGrid
      columnSizes={{ xs: 12, md: 6, lg: 5 }}
      hasEqualColumnHeights={false}
    >
      {courseRunsToDisplay.map((courseRun) => {
        if (isPendingUserSubsidyApplicableToCourse) {
          return (
            <Card isLoading>
              <Card.Header />
              <Card.Section />
              <Card.Footer />
            </Card>
          );
        }
        if (shouldUseDeprecatedCourseRunCard) {
          return (
            <DeprecatedCourseRunCard
              key={courseRun.uuid}
              courseKey={courseKey}
              userEnrollments={enterpriseCourseEnrollments}
              courseRun={courseRun}
              catalogList={catalogList}
              userEntitlements={userEntitlements}
              courseEntitlements={courseMetadata.entitlements}
              missingUserSubsidyReason={missingUserSubsidyReason}
            />
          );
        }
        return (
          <CourseRunCard
            key={courseRun.uuid}
            courseRun={courseRun}
          />
        );
      })}
    </CardGrid>
  );
};

export default CourseRunCards;
