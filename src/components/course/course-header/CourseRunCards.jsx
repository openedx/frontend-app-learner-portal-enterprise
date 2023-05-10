import React, { useContext } from 'react';
import { CardGrid } from '@edx/paragon';

import { CourseContext } from '../CourseContextProvider';
import CourseRunCard from './CourseRunCard';

/**
 * Displays a grid of `CourseRunCard` components, where each `CourseRunCard` represents
 * an available/enrollable course run.
 */
const CourseRunCards = () => {
  const {
    state: courseData,
    subsidyRequestCatalogsApplicableToCourse,
  } = useContext(CourseContext);
  const {
    availableCourseRuns,
    redeemabilityPerContentKey,
    userEntitlements,
    userEnrollments,
    missingUserSubsidyReason,
    course: { key },
    catalog: { catalogList },
  } = courseData;

  return (
    <CardGrid
      columnSizes={{ sm: 12, lg: 5 }}
      hasEqualColumnHeights={false}
    >
      {availableCourseRuns.map((courseRun) => {
        const redeemabilityForContentKey = redeemabilityPerContentKey.find(r => r.contentKey === courseRun.key);
        const redeemableSubsidyAccessPolicy = redeemabilityForContentKey?.redeemableSubsidyAccessPolicy;

        if (redeemableSubsidyAccessPolicy || missingUserSubsidyReason?.userMessage) {
          return (
            <CourseRunCard
              key={courseRun.uuid}
              courseRun={courseRun}
              subsidyAccessPolicy={redeemableSubsidyAccessPolicy}
              missingUserSubsidyReason={missingUserSubsidyReason}
            />
          );
        }
        return (
          <CourseRunCard.Deprecated
            key={courseRun.uuid}
            courseKey={key}
            userEnrollments={userEnrollments}
            courseRun={courseRun}
            catalogList={catalogList}
            userEntitlements={userEntitlements}
            subsidyRequestCatalogsApplicableToCourse={subsidyRequestCatalogsApplicableToCourse}
            missingUserSubsidyReason={missingUserSubsidyReason}
          />
        );
      })}
    </CardGrid>
  );
};

export default CourseRunCards;
