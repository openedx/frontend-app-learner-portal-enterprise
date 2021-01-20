import React, { useContext } from 'react';
import Skeleton from 'react-loading-skeleton';
import { AppContext } from '@edx/frontend-platform/react';

import { CourseContext } from './CourseContextProvider';
import { UserSubsidyContext } from '../enterprise-user-subsidy/UserSubsidy';
import { numberWithPrecision, hasLicenseSubsidy } from './data/utils';

import {
  useCoursePriceForUserSubsidy,
} from './data/hooks';

const CourseSidebarPrice = () => {
  const { state } = useContext(CourseContext);
  const { activeCourseRun, userSubsidy, catalog: { catalogList } } = state;
  const { enterpriseConfig } = useContext(AppContext);
  const { offers: { offers } } = useContext(UserSubsidyContext);
  const [coursePrice, currency] = useCoursePriceForUserSubsidy(activeCourseRun, userSubsidy, offers, catalogList);

  if (!coursePrice) {
    return <Skeleton height={24} />;
  }

  if (hasLicenseSubsidy(userSubsidy)) {
    return (
      <>
        {!enterpriseConfig.hideCourseOriginalPrice && (
          <div className="mb-2">
            <del>${numberWithPrecision(coursePrice.list)} {currency}</del>
          </div>
        )}
        <span>Included in your subscription</span>
      </>
    );
  }

  const hasDiscountedPrice = coursePrice.discounted < coursePrice.list;
  if (!hasDiscountedPrice) {
    return <span>${numberWithPrecision(coursePrice.list)} {currency}</span>;
  }

  return (
    <>
      <div className="mb-2">
        {coursePrice.discounted > 0 ? (
          <>
            ${numberWithPrecision(coursePrice.discounted)}
            {!enterpriseConfig?.hideCourseOriginalPrice && (
              <>
                {' '}
                <del>${numberWithPrecision(coursePrice.list)}</del>
              </>
            )}
            {' '}
          </>
        ) : (
          <>
            ${numberWithPrecision(coursePrice.discounted)} {currency}
          </>
        )}
      </div>
      <span>Sponsored by {enterpriseConfig.name}</span>
    </>
  );
};

export default CourseSidebarPrice;
