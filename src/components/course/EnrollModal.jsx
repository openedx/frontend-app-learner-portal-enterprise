import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow, AlertModal, Button, Icon, Spinner, Stack,
} from '@openedx/paragon';
import { Check } from '@openedx/paragon/icons';

import { ENTERPRISE_OFFER_TYPE } from '../enterprise-user-subsidy/enterprise-offers/data/constants';
import { COUPON_CODE_SUBSIDY_TYPE, ENTERPRISE_OFFER_SUBSIDY_TYPE, LEARNER_CREDIT_SUBSIDY_TYPE } from '../app/data';

export const createUseCouponCodeText = couponCodesCount => `You are about to redeem 1 enrollment code from your ${couponCodesCount} remaining codes.`;

export const createUseEnterpriseOfferText = (offer, courseRunPrice) => {
  if (offer.offerType === ENTERPRISE_OFFER_TYPE.ENROLLMENTS_LIMIT) {
    return 'You are about to redeem 1 learner credit. This action cannot be reversed.';
  }
  return `You are about to redeem $${courseRunPrice} from your learner credit. This action cannot be reversed.`;
};

const UpgradeConfirmationModalListItem = ({
  icon,
  children,
}) => (
  <li>
    <Stack direction="horizontal" gap={2}>
      <Icon src={icon} />
      {children}
    </Stack>
  </li>
);

UpgradeConfirmationModalListItem.propTypes = {
  icon: PropTypes.elementType,
  children: PropTypes.node.isRequired,
};
UpgradeConfirmationModalListItem.defaultProps = {
  icon: Check,
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
    title: 'Use learner credit for this course?', // refers to *legacy* learner credit
  },
  HAS_LEARNER_CREDIT: {
    Body: () => (
      <>
        <p>This course is covered by your organization, which allows you to upgrade for free.</p>
        <p>By upgrading, you will get:</p>
        <ul className="list-unstyled">
          <Stack gap={1}>
            <UpgradeConfirmationModalListItem>
              Unlimited access to course materials
            </UpgradeConfirmationModalListItem>
            <UpgradeConfirmationModalListItem>
              Feedback and graded assignments
            </UpgradeConfirmationModalListItem>
            <UpgradeConfirmationModalListItem>
              Shareable certifcate upon completion
            </UpgradeConfirmationModalListItem>
          </Stack>
        </ul>
      </>
    ),
    // TODO: button text should be stateful to account for async loading
    button: 'Confirm upgrade',
    title: 'Upgrade for free',
  },
};

const getModalTexts = ({ userSubsidyApplicableToCourse, couponCodesCount, courseRunPrice }) => {
  const { HAS_COUPON_CODE, HAS_ENTERPRISE_OFFER, HAS_LEARNER_CREDIT } = MODAL_TEXTS;
  const { subsidyType } = userSubsidyApplicableToCourse || {};

  if (subsidyType === COUPON_CODE_SUBSIDY_TYPE) {
    return {
      paymentRequiredForCourse: false,
      buttonText: HAS_COUPON_CODE.button,
      enrollText: HAS_COUPON_CODE.body(couponCodesCount),
      titleText: HAS_COUPON_CODE.title,
    };
  }

  if (subsidyType === ENTERPRISE_OFFER_SUBSIDY_TYPE) {
    return {
      paymentRequiredForCourse: false,
      buttonText: HAS_ENTERPRISE_OFFER.button,
      enrollText: HAS_ENTERPRISE_OFFER.body(userSubsidyApplicableToCourse, courseRunPrice),
      titleText: HAS_ENTERPRISE_OFFER.title,
    };
  }

  if (subsidyType === LEARNER_CREDIT_SUBSIDY_TYPE) {
    return {
      paymentRequiredForCourse: false,
      buttonText: HAS_LEARNER_CREDIT.button,
      enrollText: <HAS_LEARNER_CREDIT.Body />, // TODO: determine whether this pattern/convention still makes sense
      titleText: HAS_LEARNER_CREDIT.title,
    };
  }

  // Otherwise, given subsidy type is not supported for the enroll/upgrade modal
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

  const handleEnroll = async (e) => {
    if (!onEnroll) {
      return;
    }
    setIsLoading(true);
    await onEnroll(e);
    setIsLoading(false);
  };

  const dismissModal = () => {
    setIsModalOpen(false);
    setIsLoading(false);
  };

  const {
    paymentRequiredForCourse,
    titleText,
    enrollText,
    buttonText,
  } = getModalTexts({
    userSubsidyApplicableToCourse,
    couponCodesCount,
    courseRunPrice,
  });

  // Check whether the modal should be rendered (i.e., do not show modal if user has no applicable subsidy)
  // as payment would be required for the learner to enroll in the course.
  if (paymentRequiredForCourse) {
    return null;
  }

  return (
    <AlertModal
      isOpen={isModalOpen}
      closeLabel="Cancel"
      title={titleText}
      footerNode={(
        <ActionRow>
          <Button
            variant="tertiary"
            onClick={dismissModal}
          >
            Cancel
          </Button>
          {/* FIXME: the following Button should be using StatefulButton from @openedx/paragon */}
          <Button
            // TODO: remove no-op behavior for learner credit
            href={userSubsidyApplicableToCourse.subsidyType === LEARNER_CREDIT_SUBSIDY_TYPE ? undefined : enrollmentUrl}
            onClick={handleEnroll}
          >
            {isLoading && <Spinner animation="border" className="mr-2" variant="light" size="sm" screenReaderText="Loading" />}
            {buttonText}
          </Button>
        </ActionRow>
      )}
      onClose={dismissModal}
    >
      {enrollText}
    </AlertModal>
  );
};

EnrollModal.propTypes = {
  isModalOpen: PropTypes.bool.isRequired,
  setIsModalOpen: PropTypes.func.isRequired,
  enrollmentUrl: PropTypes.string.isRequired,
  userSubsidyApplicableToCourse: PropTypes.shape({
    subsidyType: PropTypes.oneOf(
      [COUPON_CODE_SUBSIDY_TYPE, ENTERPRISE_OFFER_SUBSIDY_TYPE, LEARNER_CREDIT_SUBSIDY_TYPE],
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
