import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Modal } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import {
  useOptimizelyEnrollmentClickHandler,
  useTrackSearchConversionClickHandler,
} from './data/hooks';

export const ENROLL_MODAL_TEXT_NO_COUPON_CODES = 'Your organization has not provided you with access to courses, but you may still enroll in this course after payment.';
export const createUseVoucherText = couponCodesCount => `Enrolling in this course will use 1 of your ${couponCodesCount} enrollment codes.`;

export const modalText = {
  noCouponCodes: {
    body: ENROLL_MODAL_TEXT_NO_COUPON_CODES,
    button: 'Continue to payment',
    title: 'Payment required for course enrollment',
  },
  hasCouponCodes: {
    body: (couponCodesCount) => createUseVoucherText(couponCodesCount),
    button: 'Enroll in course',
    title: 'Use 1 enrollment code for this course?',
  },
};

const EnrollModal = ({
  enrollmentUrl,
  isModalOpen,
  couponCodesCount,
  hasCouponCodeForCourse,
  setIsModalOpen,
}) => {
  const analyticsHandler = useTrackSearchConversionClickHandler({
    href: enrollmentUrl,
    eventName: 'edx.ui.enterprise.learner_portal.course.enroll_button.to_ecommerce_basket.clicked',
  });
  const optimizelyHandler = useOptimizelyEnrollmentClickHandler({
    href: enrollmentUrl,
  });

  const [submitting, setSubmitting] = useState(false);
  const { hasCouponCodes, noCouponCodes } = modalText;
  const buttonText = hasCouponCodeForCourse ? hasCouponCodes.button : noCouponCodes.button;
  const enrollText = hasCouponCodeForCourse ? hasCouponCodes.body(couponCodesCount) : noCouponCodes.body;
  const titleText = hasCouponCodeForCourse ? hasCouponCodes.title : noCouponCodes.title;

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
          onClick={(e) => {
            setSubmitting(true);
            analyticsHandler(e);
            optimizelyHandler(e);
          }}
        >
          <>
            {submitting && <FontAwesomeIcon icon={faSpinner} alt="loading" className="fa-spin mr-2" />}
            {buttonText}
          </>
        </a>,
      ]}
      onClose={() => setIsModalOpen(false)}
    />
  );
};

EnrollModal.propTypes = {
  hasCouponCodeForCourse: PropTypes.bool.isRequired,
  enrollmentUrl: PropTypes.string.isRequired,
  isModalOpen: PropTypes.bool.isRequired,
  couponCodesCount: PropTypes.number.isRequired,
  setIsModalOpen: PropTypes.func.isRequired,
};

export default EnrollModal;
