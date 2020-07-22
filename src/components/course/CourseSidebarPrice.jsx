import React, { useContext } from 'react';
import Skeleton from 'react-loading-skeleton';
import { AppContext } from '@edx/frontend-platform/react';

import { CourseContext } from './CourseContextProvider';

import { LICENSE_SUBSIDY_TYPE } from './data/constants';
import {
  useCoursePriceForUserSubsidy,
  useFetchUserSubsidyForCourse,
} from './data/hooks';

const CourseSidebarPrice = () => {
  const { state } = useContext(CourseContext);
  const { activeCourseRun } = state;
  const { enterpriseConfig } = useContext(AppContext);
  const [userSubsidy, isLoading] = useFetchUserSubsidyForCourse(activeCourseRun, enterpriseConfig);
  const coursePrice = useCoursePriceForUserSubsidy(activeCourseRun, userSubsidy);

  if (isLoading || !coursePrice) {
    return <Skeleton height={24} />;
  }

  if (userSubsidy?.subsidyType === LICENSE_SUBSIDY_TYPE) {
    return (
      <>
        <div className="mb-2">
          <del>${coursePrice.list} USD</del>
        </div>
        <span>Included in your subscription</span>
      </>
    );
  }

  const hasDiscountedPrice = coursePrice?.discounted < coursePrice?.list;
  if (hasDiscountedPrice) {
    return (
      <>
        <div className="mb-2">
          ${coursePrice.discounted} <del>${coursePrice.list}</del> USD
        </div>
        <span>Sponsored by {enterpriseConfig.name}</span>
      </>
    );
  }

  return (
    <span>${coursePrice.list} USD</span>
  );
};

export default CourseSidebarPrice;
