import React, { useContext } from 'react';
import { Skeleton } from '@edx/paragon';
import classNames from 'classnames';
import { AppContext } from '@edx/frontend-platform/react';

import { CourseContext } from './CourseContextProvider';
import { numberWithPrecision } from './data/utils';
import {
  useCoursePriceForUserSubsidy,
} from './data/hooks';
import { SubsidyRequestsContext } from '../enterprise-subsidy-requests';
import { ENTERPRISE_OFFER_SUBSIDY_TYPE, LEARNER_CREDIT_SUBSIDY_TYPE, LICENSE_SUBSIDY_TYPE } from './data/constants';

export const INCLUDED_IN_SUBSCRIPTION_MESSAGE = 'Included in your subscription';
export const FREE_WHEN_APPROVED_MESSAGE = 'Free to me\n(when approved)';
export const COVERED_BY_ENTERPRISE_OFFER_MESSAGE = 'This course can be purchased with your organization\'s learner credit';

const CourseSidebarPrice = () => {
  const { enterpriseConfig } = useContext(AppContext);
  const { state: courseData } = useContext(CourseContext);
  const { course, activeCourseRun, userSubsidyApplicableToCourse } = courseData;
  const { subsidyRequestConfiguration } = useContext(SubsidyRequestsContext);

  const [coursePrice, currency] = useCoursePriceForUserSubsidy({
    courseEntitlements: course?.entitlements,
    activeCourseRun,
    userSubsidyApplicableToCourse,
  });

  if (!coursePrice) {
    return <Skeleton containerTestId="course-price-skeleton" height={24} />;
  }

  const originalPriceDisplay = numberWithPrecision(coursePrice.list);
  const showOrigPrice = !enterpriseConfig.hideCourseOriginalPrice;
  const crossedOutOriginalPrice = (
    <del>
      <span className="sr-only">Priced reduced from:</span>${originalPriceDisplay} {currency}
    </del>
  );

  // Case 1: License subsidy found
  if (userSubsidyApplicableToCourse?.subsidyType === LICENSE_SUBSIDY_TYPE) {
    return (
      <>
        {showOrigPrice && (
          <div className="mb-2">
            {crossedOutOriginalPrice}
          </div>
        )}
        <span>{INCLUDED_IN_SUBSCRIPTION_MESSAGE}</span>
      </>
    );
  }

  const hasDiscountedPrice = coursePrice.discounted < coursePrice.list;
  // Case 2: No subsidies found but Browse and Request Enabled
  if (!hasDiscountedPrice && subsidyRequestConfiguration?.subsidyRequestsEnabled
  ) {
    return (
      <span style={{ whiteSpace: 'pre-wrap' }} data-testid="browse-and-request-pricing">
        <s>${originalPriceDisplay} {currency}</s><br />
        {FREE_WHEN_APPROVED_MESSAGE}
      </span>
    );
  }

  // Case 3: No subsidies found
  if (!hasDiscountedPrice) {
    return (
      <span className="d-block">
        ${originalPriceDisplay} {currency}
      </span>
    );
  }

  const learnerCreditSubsidyTypes = [ENTERPRISE_OFFER_SUBSIDY_TYPE, LEARNER_CREDIT_SUBSIDY_TYPE];
  const shouldShowLearnerCreditMessage = learnerCreditSubsidyTypes.includes(userSubsidyApplicableToCourse?.subsidyType);
  const discountedPriceMessage = shouldShowLearnerCreditMessage ? COVERED_BY_ENTERPRISE_OFFER_MESSAGE : `Sponsored by ${enterpriseConfig.name}`;

  // Case 4: subsidy found
  const discountedPriceDisplay = `${numberWithPrecision(coursePrice.discounted)} ${currency}`;
  return (
    <>
      <div className={classNames({ 'mb-2': coursePrice.discounted > 0 || showOrigPrice })}>
        {/* discounted > 0 means partial discount */}
        {showOrigPrice && <>{crossedOutOriginalPrice}{' '}</>}
        {coursePrice.discounted > 0 && (
          <>
            <span className="sr-only">Discounted price:</span>${discountedPriceDisplay}
          </>
        )}
      </div>
      <small>{discountedPriceMessage}</small>
    </>
  );
};

export default CourseSidebarPrice;
