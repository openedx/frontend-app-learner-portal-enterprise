import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Modal } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { useTrackSearchConversionClickHandler } from './data/hooks';

export const ENROLL_MODAL_TEXT_NO_OFFERS = 'Your organization has not provided you with access to courses, but you may still enroll in this course after payment.';
export const createUseVoucherText = offersCount => `Enrolling in this course will use 1 of your ${offersCount} enrollment codes.`;

export const modalText = {
  noOffers: {
    body: ENROLL_MODAL_TEXT_NO_OFFERS,
    button: 'Continue to payment',
    title: 'Payment required for course enrollment',
  },
  fullOffers: {
    body: (offersCount) => createUseVoucherText(offersCount),
    button: 'Enroll in course',
    title: 'Use 1 enrollment code for this course?',
  },
};

const EnrollModal = ({
  courseHasOffer,
  enrollmentUrl,
  isModalOpen,
  offersCount,
  setIsModalOpen,
}) => {
  const handleTrackingClick = useTrackSearchConversionClickHandler({
    href: enrollmentUrl,
    eventName: 'edx.ui.enterprise.learner_portal.course.enroll_button.to_ecommerce_basket.clicked',
  });
  const [submitting, setSubmitting] = useState(false);
  const { fullOffers, noOffers } = modalText;
  const buttonText = courseHasOffer ? fullOffers.button : noOffers.button;
  const enrollText = courseHasOffer ? fullOffers.body(offersCount) : noOffers.body;
  const titleText = courseHasOffer ? fullOffers.title : noOffers.title;

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
            handleTrackingClick(e);
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
  courseHasOffer: PropTypes.bool.isRequired,
  enrollmentUrl: PropTypes.string.isRequired,
  isModalOpen: PropTypes.bool.isRequired,
  offersCount: PropTypes.number.isRequired,
  setIsModalOpen: PropTypes.func.isRequired,
};

export default EnrollModal;
