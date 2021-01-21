import React, { useContext } from 'react';
import Skeleton from 'react-loading-skeleton';
import { AppContext } from '@edx/frontend-platform/react';

import { CourseContext } from './CourseContextProvider';
import { UserSubsidyContext } from '../enterprise-user-subsidy/UserSubsidy';
import { numberWithPrecision, hasLicenseSubsidy } from './data/utils';

import {
  useCoursePriceForUserSubsidy,
} from './data/hooks';

export const INCLUDED_IN_SUBSCRIPTION_MESSAGE = 'Included in your subscription';

const CourseSidebarPrice = () => {
  const { state: courseData } = useContext(CourseContext);
  const { activeCourseRun, userSubsidy, catalog: { catalogList } } = courseData;
  const { enterpriseConfig } = useContext(AppContext);
  const { offers: { offers } } = useContext(UserSubsidyContext);
  const [coursePrice, currency] = useCoursePriceForUserSubsidy({
    activeCourseRun, userSubsidy, offers, catalogList,
  });

  if (!coursePrice) {
    return <Skeleton height={24} />;
  }

  const originalPriceDisplay = numberWithPrecision(coursePrice.list);
  const showOrigPrice = !enterpriseConfig.hideCourseOriginalPrice;
  const crossedOutOriginalPrice = (
    <>
      {' '}
      <del><span className="sr-only">Priced reduced from:</span>${originalPriceDisplay} {currency}</del>
      {' '}
    </>
  );

  // Case 1: License subsidy found
  if (hasLicenseSubsidy(userSubsidy)) {
    return (
      <>
        {showOrigPrice && (
          <div className="mb-2">
            <del>
              <span className="sr-only">Priced reduced from:</span>${originalPriceDisplay} {currency}
            </del>
          </div>
        )}
        <span>{INCLUDED_IN_SUBSCRIPTION_MESSAGE}</span>
      </>
    );
  }

  // Case 2: No subsidies found
  const hasDiscountedPrice = coursePrice.discounted < coursePrice.list;
  if (!hasDiscountedPrice) {
    return <>{showOrigPrice && <span>${originalPriceDisplay} {currency}</span>}</>;
  }

  // Case 3: offer subsidy found
  const discountedPriceDisplay = `${numberWithPrecision(coursePrice.discounted)} ${currency}`;
  return (
    <>
      <div className="mb-2">
        {coursePrice.discounted > 0 ? (
          <>
            <span className="sr-only">Discounted price:</span>${discountedPriceDisplay}
            {showOrigPrice && crossedOutOriginalPrice}
          </>
        ) : (
          <>
            {showOrigPrice && crossedOutOriginalPrice}
          </>
        )}
      </div>
      <span>Sponsored by {enterpriseConfig.name}</span>
    </>
  );
};

export default CourseSidebarPrice;
