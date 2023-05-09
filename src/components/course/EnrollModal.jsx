import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { COUPON_CODE_SUBSIDY_TYPE, ENTERPRISE_OFFER_SUBSIDY_TYPE } from './data/constants';
import { ENTERPRISE_OFFER_TYPE } from '../enterprise-user-subsidy/enterprise-offers/data/constants';

export const createUseCouponCodeText = couponCodesCount => `You are about to redeem 1 enrollment code from your ${couponCodesCount} remaining codes.`;

export const createUseEnterpriseOfferText = (offer, courseRunPrice) => {
  if (offer.offerType === ENTERPRISE_OFFER_TYPE.ENROLLMENTS_LIMIT) {
    return 'You are about to redeem 1 learner credit. This action cannot be reversed.';
  }
  return `You are about to redeem $${courseRunPrice} from your learner credit. This action cannot be reversed.`;
};

export const MODAL_TEXTS = {
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

const getModalTexts = ({ userSubsidyApplicableToCourse, couponCodesCount, courseRunPrice }) => {
  const { HAS_COUPON_CODE, HAS_ENTERPRISE_OFFER } = MODAL_TEXTS;

  if (userSubsidyApplicableToCourse?.subsidyType === COUPON_CODE_SUBSIDY_TYPE) {
    return {
      paymentRequiredForCourse: false,
      buttonText: HAS_COUPON_CODE.button,
      enrollText: HAS_COUPON_CODE.body(couponCodesCount),
      titleText: HAS_COUPON_CODE.title,
    };
  }

  if (userSubsidyApplicableToCourse?.subsidyType === ENTERPRISE_OFFER_SUBSIDY_TYPE) {
    return {
      paymentRequiredForCourse: false,
      buttonText: HAS_ENTERPRISE_OFFER.button,
      enrollText: HAS_ENTERPRISE_OFFER.body(userSubsidyApplicableToCourse, courseRunPrice),
      titleText: HAS_ENTERPRISE_OFFER.title,
    };
  }

  return { paymentRequiredForCourse: true };
};

const EnrollModal = ({
  isModalOpen,
  setIsModalOpen,
  enrollmentUrl,
  courseRunPrice,
  userSubsidyApplicableToCourse,
  couponCodesCount,
  onEnroll,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleEnroll = (e) => {
    setIsLoading(true);
    if (onEnroll) {
      onEnroll(e);
    }
  };

  const {
    paymentRequiredForCourse, titleText, enrollText, buttonText,
  } = getModalTexts({ userSubsidyApplicableToCourse, couponCodesCount, courseRunPrice });

  // Check whether the modal should be rendered (i.e., do not show modal if user has no applicable subsidy)
  // as payment would be required for the learner to enroll in the course.
  if (paymentRequiredForCourse) {
    return null;
  }

  return (
    <Modal
      open={isModalOpen}
      closeText="Cancel"
      title={titleText}
      body={<div><p>{enrollText}</p></div>}
      buttons={[
        <Button
          href={enrollmentUrl}
          onClick={handleEnroll}
        >
          {isLoading && <FontAwesomeIcon icon={faSpinner} alt="loading" className="fa-spin mr-2" />}
          {buttonText}
        </Button>,
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
  onEnroll: PropTypes.func,
};

EnrollModal.defaultProps = {
  userSubsidyApplicableToCourse: undefined,
  onEnroll: undefined,
};

export default EnrollModal;
