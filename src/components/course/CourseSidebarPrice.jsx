import { Skeleton } from '@openedx/paragon';
import classNames from 'classnames';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  getContentPriceDisplay,
  useCanUserRequestSubsidyForCourse,
  useCoursePrice,
  useIsCourseAssigned,
  useUserSubsidyApplicableToCourse,
} from './data';
import {
  ENTERPRISE_OFFER_SUBSIDY_TYPE,
  LEARNER_CREDIT_SUBSIDY_TYPE,
  LICENSE_SUBSIDY_TYPE,
  useEnterpriseCustomer,
} from '../app/data';
import { sumOfArray } from '../../utils/common';

const CourseSidebarPrice = () => {
  const intl = useIntl();
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { coursePrice, currency } = useCoursePrice();
  const { isCourseAssigned } = useIsCourseAssigned();
  const canRequestSubsidy = useCanUserRequestSubsidyForCourse();
  const { userSubsidyApplicableToCourse } = useUserSubsidyApplicableToCourse();
  if (!coursePrice) {
    return <Skeleton containerTestId="course-price-skeleton" height={24} />;
  }
  const originalPriceDisplay = getContentPriceDisplay(coursePrice.listRange);
  const showOrigPrice = !enterpriseCustomer.hideCourseOriginalPrice;
  const crossedOutOriginalPrice = (
    <del>
      <span className="sr-only">
        <FormattedMessage
          id="enterprise.course.about.price.original"
          defaultMessage="Priced reduced from:"
          description="Message to indicate that the price has been reduced."
        />
      </span>
      {originalPriceDisplay} {currency}
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
        <span>
          <FormattedMessage
            id="enterprise.course.about.price.included.in.subscription"
            defaultMessage="Included in your subscription"
            description="Message to indicate that the course is included in the user's subscription."
          />
        </span>
      </>
    );
  }

  const hasDiscountedPrice = coursePrice.discountedList
    && sumOfArray(coursePrice.discountedList) < sumOfArray(coursePrice.listRange);
  // Case 2: No subsidies found but learner can request a subsidy
  if (!hasDiscountedPrice && canRequestSubsidy) {
    return (
      <span style={{ whiteSpace: 'pre-wrap' }} data-testid="browse-and-request-pricing">
        <s>{originalPriceDisplay} {currency}</s><br />
        <FormattedMessage
          id="enterprise.course.about.course.sidebar.price.free.when.approved"
          defaultMessage="Free to me{br}(when approved)"
          description="Message to indicate that the course is free when approved by the enterprise. The {br} is a line break."
          values={{ br: <br /> }}
        />
      </span>
    );
  }

  // Case 3: No subsidies found
  if (!hasDiscountedPrice) {
    return (
      <span className="d-block">
        {originalPriceDisplay} {currency}
      </span>
    );
  }

  // Case 4: subsidy found
  const learnerCreditSubsidyTypes = [ENTERPRISE_OFFER_SUBSIDY_TYPE, LEARNER_CREDIT_SUBSIDY_TYPE];
  const shouldShowLearnerCreditMessage = learnerCreditSubsidyTypes.includes(userSubsidyApplicableToCourse?.subsidyType);
  let discountedPriceMessage = intl.formatMessage(
    {
      id: 'enterprise.course.about.course.sidebar.price.covered.by.enterprise',
      defaultMessage: 'Sponsored by {enterpriseName}',
      description: 'Message to indicate that the course is sponsored by the enterprise.',
    },
    { enterpriseName: enterpriseCustomer.name },
  );
  if (shouldShowLearnerCreditMessage) {
    discountedPriceMessage = intl.formatMessage({
      id: 'enterprise.course.about.course.sidebar.price.covered.by.learner.credit',
      defaultMessage: "This course can be purchased with your organization's learner credit",
      description: 'Message to indicate that the course is covered by learner credit.',
    });
    if (isCourseAssigned) {
      discountedPriceMessage = intl.formatMessage({
        id: 'enterprise.course.about.course.sidebar.price.assigned.course',
        defaultMessage: 'This course is assigned to you. The price of this course is already covered by your organization.',
        description: 'Message to indicate that the course is assigned to the user.',
      });
    }
  }
  const discountedPriceDisplay = `${getContentPriceDisplay(coursePrice.discountedList)} ${currency}`;
  return (
    <>
      <div className={classNames({ 'mb-2': sumOfArray(coursePrice.discountedList) > 0 || showOrigPrice })}>
        {/* discountedList > 0 means partial discount */}
        {showOrigPrice && <>{crossedOutOriginalPrice}{' '}</>}
        {sumOfArray(coursePrice.discountedList) > 0 && (
          <>
            <span className="sr-only">
              <FormattedMessage
                id="enterprise.course.about.price.discounted"
                defaultMessage="Discounted price:"
                description="Message to indicate that the price has been discountedList."
              />
            </span>
            {discountedPriceDisplay}
          </>
        )}
      </div>
      <small>{discountedPriceMessage}</small>
    </>
  );
};

export default CourseSidebarPrice;
