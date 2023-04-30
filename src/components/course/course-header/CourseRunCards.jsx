import React, { useContext } from 'react';
import { CardGrid } from '@edx/paragon';

import DeprecatedCourseRunCards from './deprecated/CourseRunCards';

import { CourseContext } from '../CourseContextProvider';
import CourseRunCard from './CourseRunCard';

/**
 * Displays a grid of `CourseRunCard` components, where each `CourseRunCard` represents
 * an available/enrollable course run.
 */
/* istanbul ignore next */
const CourseRunCards = () => {
  const { state: courseData } = useContext(CourseContext);
  const { availableCourseRuns, redeemabilityPerContentKey } = courseData;

  return (
    <CardGrid columnSizes={{ sm: 12, lg: 5 }}>
      {availableCourseRuns.map((courseRun) => {
        const redeemabilityForContentKey = redeemabilityPerContentKey.find(r => r.contentKey === courseRun.key);
        const redeemableSubsidyAccessPolicy = redeemabilityForContentKey?.redeemableSubsidyAccessPolicy;
        return (
          <CourseRunCard
            key={courseRun.uuid}
            courseRun={courseRun}
            subsidyAccessPolicy={redeemableSubsidyAccessPolicy}
          />
        );
      })}
    </CardGrid>
  );
};

/* istanbul ignore next */
CourseRunCards.Deprecated = DeprecatedCourseRunCards;

export default CourseRunCards;
