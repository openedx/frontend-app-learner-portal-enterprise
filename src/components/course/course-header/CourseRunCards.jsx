import { useParams } from 'react-router-dom';
import { CardGrid } from '@openedx/paragon';

import CourseRunCard from './CourseRunCard';
import DeprecatedCourseRunCard from './deprecated/CourseRunCard';
import { useUserSubsidyApplicableToCourse } from '../data';
import {
  useCourseMetadata,
  useEnterpriseCourseEnrollments,
  useEnterpriseCustomerContainsContent,
  useUserEntitlements,
  LEARNER_CREDIT_SUBSIDY_TYPE,
} from '../../app/data';

/**
 * Displays a grid of `CourseRunCard` components, where each `CourseRunCard` represents
 * an available/enrollable course run.
 */
const CourseRunCards = () => {
  const { courseKey } = useParams();
  const {
    userSubsidyApplicableToCourse,
    missingUserSubsidyReason,
  } = useUserSubsidyApplicableToCourse();
  const { data: courseMetadata } = useCourseMetadata();
  const { data: { catalogList } } = useEnterpriseCustomerContainsContent([courseKey]);
  const { data: { enterpriseCourseEnrollments } } = useEnterpriseCourseEnrollments();
  const { data: userEntitlements } = useUserEntitlements();

  return (
    <CardGrid
      columnSizes={{ xs: 12, md: 6, lg: 5 }}
      hasEqualColumnHeights={false}
    >
      {courseMetadata.availableCourseRuns.map((courseRun) => {
        const hasRedeemablePolicy = userSubsidyApplicableToCourse?.subsidyType === LEARNER_CREDIT_SUBSIDY_TYPE;

        // Render the newer `CourseRunCard` component when the user's subsidy, if any, is
        // a policy OR if there is a known disabled enroll reason.
        if (hasRedeemablePolicy || missingUserSubsidyReason?.userMessage) {
          return (
            <CourseRunCard
              key={courseRun.uuid}
              courseRun={courseRun}
            />
          );
        }

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
      })}
    </CardGrid>
  );
};

export default CourseRunCards;
