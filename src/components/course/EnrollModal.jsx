import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ActionRow, ModalDialog } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { COUPON_CODE_SUBSIDY_TYPE, ENTERPRISE_OFFER_SUBSIDY_TYPE } from './data/constants';
import { ENTERPRISE_OFFER_TYPE } from '../enterprise-user-subsidy/enterprise-offers/data/constants';

export const ENROLL_MODAL_TEXT_HAS_NO_SUBSIDY = 'Your organization has not provided you with access to courses, but you may still enroll in this course after payment.';
export const createUseCouponCodeText = couponCodesCount => `You are about to redeem 1 enrollment code from your ${couponCodesCount} remaining codes.`;
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
  onEnroll,
}) => {
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
    if (onEnroll) {
      onEnroll(e);
    }
  };

  const { titleText, enrollText, buttonText } = getModalTexts();

  return (
    <ModalDialog
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      hasCloseButton
    >

      <ModalDialog.Header>
        <ModalDialog.Title>
          {titleText}
        </ModalDialog.Title>
      </ModalDialog.Header>

      <ModalDialog.Body>
        <div className="p-1"><p>{enrollText}</p></div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="link">
            Cancel
          </ModalDialog.CloseButton>
          <a
            className="btn btn-primary btn-brand-primary"
            href={enrollmentUrl}
            onClick={handleEnroll}
          >
            <>
              {isLoading && <FontAwesomeIcon icon={faSpinner} alt="loading" className="fa-spin mr-2" />}
              {buttonText}
            </>
          </a>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
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
