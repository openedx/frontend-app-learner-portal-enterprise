import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Modal } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export const modalText = {
  noOffers: {
    body: 'You do not have any applicable vouchers, but you can still enroll in this course.',
    button: 'Continue to payment',
    title: 'Payment required for course enrollment',
  },
  fullOffers: {
    body: (offersCount) => `Enrolling in this course will use 1 of your ${offersCount} remaining vouchers.`,
    button: 'Enroll in course',
    title: 'Use 1 voucher for this course',
  },
};

const EnrollModal = ({
  courseHasOffer,
  enrollmentUrl,
  isModalOpen,
  offersCount,
  setIsModalOpen,
}) => {
  const { fullOffers, noOffers } = modalText;
  const [submitting, setSubmitting] = useState(false);
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
        <a className="btn btn-primary" href={enrollmentUrl} role="button" onClick={() => setSubmitting(true)}>
          <>{submitting && <FontAwesomeIcon icon={faSpinner} alt="loading" className="fa-spin mr-2" />}{buttonText}</>
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
