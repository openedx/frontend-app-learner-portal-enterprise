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
    state: {
      availableCourseRuns,
      userEntitlements,
      userEnrollments,
      course: { key, entitlements: courseEntitlements },
      catalog: { catalogList },
    },
    subsidyRequestCatalogsApplicableToCourse,
    missingUserSubsidyReason,
    redeemabilityPerContentKey,
  } = useContext(CourseContext);

  return (
    <CardGrid
      columnSizes={{ xs: 12, md: 6, lg: 5 }}
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
            courseEntitlements={courseEntitlements}
            missingUserSubsidyReason={missingUserSubsidyReason}
          />
        );
      })}
    </CardGrid>
  );
};

export default CourseRunCards;
