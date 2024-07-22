import PropTypes from 'prop-types';
import {
  ActionRow, AlertModal, Button, Icon, Stack, StatefulButton,
} from '@openedx/paragon';
import { Check } from '@openedx/paragon/icons';
import { FormattedMessage, defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import { v4 as uuidv4 } from 'uuid';

import { ENTERPRISE_OFFER_TYPE } from '../enterprise-user-subsidy/enterprise-offers/data/constants';
import {
  COUPON_CODE_SUBSIDY_TYPE,
  ENTERPRISE_OFFER_SUBSIDY_TYPE,
  LEARNER_CREDIT_SUBSIDY_TYPE,
  useEnterpriseCustomer,
} from '../app/data';

export const messages = defineMessages({
  enrollModalConfirmCta: {
    id: 'enterprise.learner_portal.enroll-upgrade-modal.buttons.enroll.text',
    defaultMessage: 'Enroll',
    description: 'Text for the enroll button in the confirmation modal',
  },
  upgradeModalConfirmCta: {
    id: 'enterprise.learner_portal.enroll-upgrade-modal.buttons.upgrade.text.default',
    defaultMessage: 'Confirm upgrade',
    description: 'Text for the upgrade button in the confirmation modal',
  },
  upgradeModalConfirmCtaPending: {
    id: 'enterprise.learner_portal.enroll-upgrade-modal.buttons.upgrade.text.pending',
    defaultMessage: 'Upgrading...',
    description: 'Text for the upgrade button in the confirmation modal, while an upgrade redemption is in pending.',
  },
  upgradeModalConfirmCtaComplete: {
    id: 'enterprise.learner_portal.enroll-upgrade-modal.buttons.upgrade.text.complete',
    defaultMessage: 'Upgraded',
    description: 'Text for the upgrade button in the confirmation modal, when an upgrade redemption is complete.',
  },
  upgradeModalConfirmCtaError: {
    id: 'enterprise.learner_portal.enroll-upgrade-modal.buttons.upgrade.text.error',
    defaultMessage: 'Try again',
    description: 'Text for the upgrade button in the confirmation modal, when an upgrade redemption is errored.',
  },
  modalCancelCta: {
    id: 'enterprise.learner_portal.enroll-upgrade-modal.buttons.cancel.text',
    defaultMessage: 'Cancel',
    description: 'Text for the cancel button in the confirmation modal',
  },
  couponCodeModalTitle: {
    id: 'enterprise.learner_portal.enroll-upgrade-modal.titles.coupon-code',
    defaultMessage: 'Use enrollment code for this course?',
    description: 'Title for the confirmation modal when using a coupon code',
  },
  enterpriseOfferModalTitle: {
    id: 'enterprise.learner_portal.enroll-upgrade-modal.titles.enterprise-offer',
    defaultMessage: 'Use learner credit for this course?', // refers to *legacy* learner credit
    description: 'Title for the confirmation modal when using an enterprise offer',
  },
  learnerCreditModalTitle: {
    id: 'enterprise.learner_portal.enroll-upgrade-modal.titles.learner-credit',
    defaultMessage: 'Upgrade for free',
    description: 'Title for the confirmation modal when using a learner credit',
  },
  couponCodesUsage: {
    id: 'enterprise.learner_portal.enroll-upgrade-modal.text.coupon-codes-usage',
    defaultMessage: 'You are about to redeem an enrollment code from your {couponCodesCount} remaining codes.',
    description: 'Text for the confirmation modal when using a coupon code',
  },
  enterpriseOfferUsageWithPrice: {
    id: 'enterprise.learner_portal.enroll-upgrade-modal.text.enterprise-offer-usage.with-price',
    defaultMessage: 'You are about to redeem {courseRunPrice} from your learner credit. This action cannot be reversed.',
    description: 'Text for the confirmation modal when using an enterprise offer with a price',
  },
  enterpriseOfferUsageWithoutPrice: {
    id: 'enterprise.learner_portal.enroll-upgrade-modal.text.enterprise-offer-usage.without-price',
    defaultMessage: 'You are about to redeem your learner credit for this course. This action cannot be reversed.',
    description: 'Text for the confirmation modal when using an enterprise offer with a limit',
  },
  upgradeCoveredByOrg: {
    id: 'enterprise.learner_portal.enroll-upgrade-modal.text.upgrade-covered-by-org',
    defaultMessage: 'This course is covered by your organization, which allows you to upgrade for free.',
    description: 'Text for the confirmation modal when upgrading is covered by the organization',
  },
  upgradeBenefitsPrefix: {
    id: 'enterprise.learner_portal.enroll-upgrade-modal.list-items.prefix',
    defaultMessage: 'By upgrading, you will get:',
    description: 'Prefix for the list of benefits of upgrading',
  },
  upgradeBenefitsUnlimitedAccess: {
    id: 'enterprise.learner_portal.enroll-upgrade-modal.list-items.unlimited-access',
    defaultMessage: 'Unlimited access to course materials',
    description: 'List item for the benefits of upgrading, including unlimited access.',
  },
  upgradeBenefitsFeedbackAndGradedAssignments: {
    id: 'enterprise.learner_portal.enroll-upgrade-modal.list-items.feedback-graded-assignments',
    defaultMessage: 'Feedback and graded assignments',
    description: 'List item for the benefits of upgrading, including feedback.',
  },
  upgradeBenefitsShareableCertificate: {
    id: 'enterprise.learner_portal.enroll-upgrade-modal.list-items.shareable-certificate',
    defaultMessage: 'Shareable certificate upon completion',
    description: 'List item for the benefits of upgrading, including a shareable certificate.',
  },
  confirmationCtaLoading: {
    id: 'enterprise.learner_portal.enroll-upgrade-modal.buttons.loading',
    defaultMessage: 'Loading...',
    description: 'Text for the confirmation button in the modal when loading',
  },
});

export const createUseEnterpriseOfferText = ({ offerType, courseRunPrice, hideCourseOriginalPrice }) => {
  const isOfferTypeEnrollmentsLimit = offerType === ENTERPRISE_OFFER_TYPE.ENROLLMENTS_LIMIT;
  if (!isOfferTypeEnrollmentsLimit && courseRunPrice && !hideCourseOriginalPrice) {
    return messages.enterpriseOfferUsageWithPrice;
  }
  return messages.enterpriseOfferUsageWithoutPrice;
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
    body: messages.couponCodesUsage,
    button: messages.enrollModalConfirmCta,
    title: messages.couponCodeModalTitle,
  },
  HAS_ENTERPRISE_OFFER: {
    body: createUseEnterpriseOfferText,
    button: messages.enrollModalConfirmCta,
    title: messages.enterpriseOfferModalTitle,
  },
  HAS_LEARNER_CREDIT: {
    Body: () => {
      const listItems = [
        <FormattedMessage {...messages.upgradeBenefitsUnlimitedAccess} />,
        <FormattedMessage {...messages.upgradeBenefitsFeedbackAndGradedAssignments} />,
        <FormattedMessage {...messages.upgradeBenefitsShareableCertificate} />,
      ];
      return (
        <>
          <p><FormattedMessage {...messages.upgradeCoveredByOrg} /></p>
          <p><FormattedMessage {...messages.upgradeBenefitsPrefix} /></p>
          <ul className="list-unstyled">
            <Stack gap={1}>
              {listItems.map((listItem) => (
                <UpgradeConfirmationModalListItem key={uuidv4()}>
                  {listItem}
                </UpgradeConfirmationModalListItem>
              ))}
            </Stack>
          </ul>
        </>
      );
    },
    button: {
      default: messages.upgradeModalConfirmCta,
      pending: messages.upgradeModalConfirmCtaPending,
      complete: messages.upgradeModalConfirmCtaComplete,
      error: messages.upgradeModalConfirmCtaError,
    },
    title: messages.learnerCreditModalTitle,
  },
};

const useModalTexts = ({ userSubsidyApplicableToCourse, couponCodesCount, courseRunPrice }) => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const intl = useIntl();
  const {
    HAS_COUPON_CODE,
    HAS_ENTERPRISE_OFFER,
    HAS_LEARNER_CREDIT,
  } = MODAL_TEXTS;
  const { subsidyType } = userSubsidyApplicableToCourse || {};

  if (subsidyType === COUPON_CODE_SUBSIDY_TYPE) {
    return {
      paymentRequiredForCourse: false,
      buttonLabels: {
        default: intl.formatMessage(HAS_COUPON_CODE.button),
      },
      enrollText: intl.formatMessage(HAS_COUPON_CODE.body, { couponCodesCount }),
      titleText: intl.formatMessage(HAS_COUPON_CODE.title),
    };
  }

  if (subsidyType === ENTERPRISE_OFFER_SUBSIDY_TYPE) {
    return {
      paymentRequiredForCourse: false,
      buttonLabels: {
        default: intl.formatMessage(HAS_ENTERPRISE_OFFER.button),
      },
      enrollText: intl.formatMessage(
        HAS_ENTERPRISE_OFFER.body({
          offerType: userSubsidyApplicableToCourse.offerType,
          courseRunPrice,
          hideCourseOriginalPrice: enterpriseCustomer.hideCourseOriginalPrice,
        }),
        { courseRunPrice: `$${courseRunPrice}` },
      ),
      titleText: intl.formatMessage(HAS_ENTERPRISE_OFFER.title),
    };
  }

  if (subsidyType === LEARNER_CREDIT_SUBSIDY_TYPE) {
    return {
      paymentRequiredForCourse: false,
      buttonLabels: {
        default: intl.formatMessage(HAS_LEARNER_CREDIT.button.default),
        pending: intl.formatMessage(HAS_LEARNER_CREDIT.button.pending),
        complete: intl.formatMessage(HAS_LEARNER_CREDIT.button.complete),
        error: intl.formatMessage(HAS_LEARNER_CREDIT.button.error),
      },
      enrollText: <HAS_LEARNER_CREDIT.Body />,
      titleText: intl.formatMessage(HAS_LEARNER_CREDIT.title),
    };
  }

  // Otherwise, given subsidy type is not supported for the enroll/upgrade modal
  return {
    paymentRequiredForCourse: true,
    buttonLabels: {
      default: null,
    },
    enrollText: null,
    titleText: null,
  };
};

const EnrollModal = ({
  isModalOpen,
  confirmationButtonState,
  onClose,
  enrollmentUrl,
  courseRunPrice,
  userSubsidyApplicableToCourse,
  couponCodesCount,
  onEnroll,
}) => {
  const intl = useIntl();

  const dismissModal = () => {
    onClose();
  };

  const {
    paymentRequiredForCourse,
    titleText,
    enrollText,
    buttonLabels,
  } = useModalTexts({
    userSubsidyApplicableToCourse,
    couponCodesCount,
    courseRunPrice,
  });

  // Check whether the modal should be rendered (i.e., do not show modal if user has no applicable subsidy)
  // as payment would be required for the learner to enroll in the course.
  if (paymentRequiredForCourse || !userSubsidyApplicableToCourse) {
    return null;
  }

  const confirmationButtonHref = userSubsidyApplicableToCourse.subsidyType === LEARNER_CREDIT_SUBSIDY_TYPE
    ? undefined
    : enrollmentUrl;

  return (
    <AlertModal
      isOpen={isModalOpen}
      closeLabel={intl.formatMessage(messages.modalCancelCta)}
      title={titleText}
      footerNode={(
        <ActionRow>
          <Button
            variant="tertiary"
            onClick={dismissModal}
          >
            <FormattedMessage {...messages.modalCancelCta} />
          </Button>
          <StatefulButton
            href={confirmationButtonHref}
            onClick={onEnroll}
            state={confirmationButtonState}
            labels={buttonLabels}
          />
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
  confirmationButtonState: PropTypes.oneOf(['default', 'pending', 'complete', 'error']),
  onClose: PropTypes.func.isRequired,
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
  confirmationButtonState: 'default',
};

export default EnrollModal;
