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
  const [coursePrice, currency] = useCoursePriceForUserSubsidy(activeCourseRun, userSubsidy);

  if (isLoading || !coursePrice) {
    return <Skeleton height={24} />;
  }

  if (userSubsidy?.subsidyType === LICENSE_SUBSIDY_TYPE) {
    return (
      <>
        {!enterpriseConfig.hideCourseOriginalPrice && (
          <div className="mb-2">
            <del>${coursePrice.list} {currency}</del>
          </div>
        )}
        <span>Included in your subscription</span>
      </>
    );
  }

  const hasDiscountedPrice = coursePrice.discounted < coursePrice.list;
  if (hasDiscountedPrice) {
    return (
      <>
        <div className="mb-2">
          {coursePrice.discounted > 0 ? (
            <>
              ${coursePrice.discounted}
              {!enterpriseConfig?.hideCourseOriginalPrice && (
                <>
                  {' '}
                  <del>${coursePrice.list}</del>
                </>
              )}
              {' '}
            </>
          ) : (
            <>
              ${coursePrice.discounted} {currency}
            </>
          )}
        </div>
        <span>Sponsored by {enterpriseConfig.name}</span>
      </>
    );
  }

  return (
    <span>${coursePrice.list} {currency}</span>
  );
};

export default CourseSidebarPrice;
