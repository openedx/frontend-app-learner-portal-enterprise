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
    course: { key },
    catalog: { catalogList },
  } = courseData;

  return (
    <CardGrid columnSizes={{ sm: 12, lg: 5 }}>
      {availableCourseRuns.map((courseRun) => {
        const redeemabilityForContentKey = redeemabilityPerContentKey.find(r => r.contentKey === courseRun.key);
        const redeemableSubsidyAccessPolicy = redeemabilityForContentKey?.redeemableSubsidyAccessPolicy;
        if (redeemableSubsidyAccessPolicy) {
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
          />
        );
      })}
    </CardGrid>
  );
};

export default CourseRunCards;
