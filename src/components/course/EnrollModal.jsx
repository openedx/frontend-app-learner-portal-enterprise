import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { Modal } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import {
  useOptimizelyEnrollmentClickHandler,
  useTrackSearchConversionClickHandler,
} from './data/hooks';
import { COUPON_CODE_SUBSIDY_TYPE, ENTERPRISE_OFFER_SUBSIDY_TYPE } from './data/constants';
import { ENTERPRISE_OFFER_TYPE } from '../enterprise-user-subsidy/enterprise-offers/data/constants';
import { CourseContext } from './CourseContextProvider';
import { CourseEnrollmentsContext } from '../dashboard/main-content/course-enrollments/CourseEnrollmentsContextProvider';

export const ENROLL_MODAL_TEXT_HAS_NO_SUBSIDY = 'Your organization has not provided you with access to courses, but you may still enroll in this course after payment.';
export const createUseCouponCodeText = couponCodesCount => `Enrolling in this course will use 1 of your ${couponCodesCount} enrollment codes.`;
export const createUseEnterpriseOfferText = (offer, courseRunPrice) => {
  if (offer.offerType === ENTERPRISE_OFFER_TYPE.ENROLLMENTS_LIMIT) {
    return 'You are about to redeem 1 learner credit. This action cannot be reversed.';
  }

  return `You are about to redeem $${courseRunPrice} from your learner credit. This action cannot be reversed.`;
};

export const MODAL_TEXTS = {
  HAS_NO_SUBSIDY: {
    body: ENROLL_MODAL_TEXT_HAS_NO_SUBSIDY,
    button: 'Continue to payment',
    title: 'Payment required for course enrollment',
  },
  HAS_COUPON_CODE: {
    body: (couponCodesCount) => createUseCouponCodeText(couponCodesCount),
    button: 'Enroll',
    title: 'Use 1 enrollment code for this course?',
  },
  HAS_ENTERPRISE_OFFER: {
    body: (offer, courseRunPrice) => createUseEnterpriseOfferText(offer, courseRunPrice),
    button: 'Enroll',
    title: 'Use learner credit for this course?',
  },
};

const EnrollModal = ({
  isModalOpen,
  setIsModalOpen,
  enrollmentUrl,
  courseRunPrice,
  userSubsidyApplicableToCourse,
  couponCodesCount,
}) => {
  const {
    state: {
      activeCourseRun: { key: courseRunKey },
    },
  } = useContext(CourseContext);
  const {
    courseEnrollmentsByStatus,
  } = useContext(CourseEnrollmentsContext);

  const analyticsHandler = useTrackSearchConversionClickHandler({
    href: enrollmentUrl,
    eventName: 'edx.ui.enterprise.learner_portal.course.enroll_button.to_ecommerce_basket.clicked',
  });
  const optimizelyHandler = useOptimizelyEnrollmentClickHandler({
    href: enrollmentUrl,
    courseRunKey,
    courseEnrollmentsByStatus,
  });

  const [isLoading, setIsLoading] = useState(false);

  const getModalTexts = () => {
    const { HAS_NO_SUBSIDY, HAS_COUPON_CODE, HAS_ENTERPRISE_OFFER } = MODAL_TEXTS;

    if (userSubsidyApplicableToCourse?.subsidyType === COUPON_CODE_SUBSIDY_TYPE) {
      return {
        buttonText: HAS_COUPON_CODE.button,
        enrollText: HAS_COUPON_CODE.body(couponCodesCount),
        titleText: HAS_COUPON_CODE.title,
      };
    }

    if (userSubsidyApplicableToCourse?.subsidyType === ENTERPRISE_OFFER_SUBSIDY_TYPE) {
      return {
        buttonText: HAS_ENTERPRISE_OFFER.button,
        enrollText: HAS_ENTERPRISE_OFFER.body(userSubsidyApplicableToCourse, courseRunPrice),
        titleText: HAS_ENTERPRISE_OFFER.title,
      };
    }

    return {
      buttonText: HAS_NO_SUBSIDY.button,
      enrollText: HAS_NO_SUBSIDY.body,
      titleText: HAS_NO_SUBSIDY.title,
    };
  };

  const handleEnroll = (e) => {
    setIsLoading(true);
    analyticsHandler(e);
    optimizelyHandler(e);
  };

  const { titleText, enrollText, buttonText } = getModalTexts();

  return (
    <Modal
      open={isModalOpen}
      closeText="Cancel"
      title={titleText}
      body={<div><p>{enrollText}</p></div>}
      buttons={[
        <a
          className="btn btn-primary btn-brand-primary"
          href={enrollmentUrl}
          onClick={handleEnroll}
        >
          <>
            {isLoading && <FontAwesomeIcon icon={faSpinner} alt="loading" className="fa-spin mr-2" />}
            {buttonText}
          </>
        </a>,
      ]}
      onClose={() => setIsModalOpen(false)}
    />
  );
};

EnrollModal.propTypes = {
  isModalOpen: PropTypes.bool.isRequired,
  setIsModalOpen: PropTypes.func.isRequired,
  enrollmentUrl: PropTypes.string.isRequired,
  userSubsidyApplicableToCourse: PropTypes.shape({
    subsidyType: PropTypes.oneOf(
      [COUPON_CODE_SUBSIDY_TYPE, ENTERPRISE_OFFER_SUBSIDY_TYPE],
    ),
    offerType: PropTypes.oneOf(
      Object.values(ENTERPRISE_OFFER_TYPE),
    ),
  }),
  couponCodesCount: PropTypes.number.isRequired,
  courseRunPrice: PropTypes.number.isRequired,
};

EnrollModal.defaultProps = {
  userSubsidyApplicableToCourse: undefined,
};

export default EnrollModal;
