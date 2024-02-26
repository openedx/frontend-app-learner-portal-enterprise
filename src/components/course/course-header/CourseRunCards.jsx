import React, { useContext } from 'react';
import { CardGrid } from '@openedx/paragon';

import { CourseContext } from '../CourseContextProvider';
import CourseRunCard from './CourseRunCard';
import DeprecatedCourseRunCard from './deprecated/CourseRunCard';
import { LEARNER_CREDIT_SUBSIDY_TYPE } from '../data/constants';

/**
 * Displays a grid of `CourseRunCard` components, where each `CourseRunCard` represents
 * an available/enrollable course run.
 */
const CourseRunCards = () => {
  const {
    state: {
      availableCourseRuns,
      userEntitlements,
      userEnrollments,
      course: { key, entitlements: courseEntitlements },
      catalog: { catalogList },
    },
    missingUserSubsidyReason,
    userSubsidyApplicableToCourse,
  } = useContext(CourseContext);

  return (
    <CardGrid
      columnSizes={{ xs: 12, md: 6, lg: 5 }}
      hasEqualColumnHeights={false}
    >
      {availableCourseRuns.map((courseRun) => {
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
            courseKey={key}
            userEnrollments={userEnrollments}
            courseRun={courseRun}
            catalogList={catalogList}
            userEntitlements={userEntitlements}
            courseEntitlements={courseEntitlements}
            missingUserSubsidyReason={missingUserSubsidyReason}
          />
        );
      })}
    </CardGrid>
  );
};

export default CourseRunCards;
