import React, { useContext } from 'react';
import Skeleton from 'react-loading-skeleton';
import classNames from 'classnames';
import { AppContext } from '@edx/frontend-platform/react';

import { CourseContext } from './CourseContextProvider';
import { numberWithPrecision } from './data/utils';
import {
  useCoursePriceForUserSubsidy,
} from './data/hooks';
import { SubsidyRequestsContext } from '../enterprise-subsidy-requests';
import { ENTERPRISE_OFFER_SUBSIDY_TYPE, LICENSE_SUBSIDY_TYPE } from './data/constants';
import { UserSubsidyContext } from '../enterprise-user-subsidy/UserSubsidy';
import ContactAdminMailto from '../contact-admin-mailto';
import { offerHasBookingsLimit } from '../enterprise-user-subsidy/enterprise-offers/data/utils';

export const INCLUDED_IN_SUBSCRIPTION_MESSAGE = 'Included in your subscription';
export const FREE_WHEN_APPROVED_MESSAGE = 'Free to me\n(when approved)';
export const COVERED_BY_ENTERPRISE_OFFER_MESSAGE = 'This course can be purchased with your organization\'s learner credit';
export const INSUFFICIENT_ENTERPRISE_OFFER_BALANCE = 'Your organization doesn\'t have enough learner credit remaining.';

const CourseSidebarPrice = () => {
  const { enterpriseConfig } = useContext(AppContext);
  const { state: courseData } = useContext(CourseContext);
  const {
    activeCourseRun,
    userSubsidyApplicableToCourse,
    course: { entitlements: courseEntitlements },
  } = courseData;
  const { subsidyRequestConfiguration } = useContext(SubsidyRequestsContext);

  const [coursePrice, currency] = useCoursePriceForUserSubsidy({
    activeCourseRun,
    userSubsidyApplicableToCourse,
    courseEntitlements,
  });

  const {
    enterpriseOffers,
    canEnrollWithEnterpriseOffers,
  } = useContext(UserSubsidyContext);

  if (!coursePrice) {
    return <Skeleton height={24} />;
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
    const { catalogList } = courseData.catalog;
    const hasOfferWithInsufficientBalance = canEnrollWithEnterpriseOffers && enterpriseOffers.find(
      (enterpriseOffer) => {
        const isCourseInCatalog = catalogList.includes(enterpriseOffer.enterpriseCatalogUuid);
        const hasInsufficientBalance = offerHasBookingsLimit(enterpriseOffer)
          && enterpriseOffer.remainingBalance < coursePrice.list;

        return isCourseInCatalog && hasInsufficientBalance;
      },
    );

    return (
      <>
        <span className="d-block">${originalPriceDisplay} {currency}</span>
        {hasOfferWithInsufficientBalance && (
          <small data-testid="insufficient-offer-balance-text">
            {INSUFFICIENT_ENTERPRISE_OFFER_BALANCE}{' '}
            <ContactAdminMailto /> to learn more.
          </small>
        )}
      </>
    );
  }

  const discountedPriceMessage = userSubsidyApplicableToCourse?.subsidyType
   === ENTERPRISE_OFFER_SUBSIDY_TYPE ? COVERED_BY_ENTERPRISE_OFFER_MESSAGE : `Sponsored by ${enterpriseConfig.name}`;

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
