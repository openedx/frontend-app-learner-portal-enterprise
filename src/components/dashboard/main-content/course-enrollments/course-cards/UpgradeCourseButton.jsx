import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { FormattedMessage, defineMessages } from '@edx/frontend-platform/i18n';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import EnrollModal from '../../../../course/EnrollModal';
import { useCouponCodes, useEnterpriseCustomer } from '../../../../app/data';
import { useCourseUpgradeData } from '../data';

const messages = defineMessages({
  upgradeButtonText: {
    id: 'enterprise.dashboard.course_enrollments.course_cards.upgrade_button',
    defaultMessage: 'Upgrade <s>for {title}</s>',
    description: 'Text for the confirmation button on the enrollment/upgrade confirmation modal.',
  },
});

function getUpgradeButtonScreenReaderText(chunks) {
  return <span className="sr-only">{chunks}</span>;
}

/**
 * Button for upgrading a course via coupon code or learner credit.
 */
const UpgradeCourseButton = ({
  className,
  title,
  variant,
  courseRunKey,
  mode,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmationButtonState, setConfirmationButtonState] = useState('default');

  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { data: { couponCodeRedemptionCount } } = useCouponCodes();

  const handleRedeem = () => {
    setConfirmationButtonState('pending');
    sendEnterpriseTrackEvent(
      enterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.dashboard.course.upgrade_button.confirmed',
    );
  };

  const handleRedemptionSuccess = async (transaction) => {
    if (transaction?.state !== 'committed') {
      return;
    }
    setConfirmationButtonState('complete');
    const { coursewareUrl } = transaction;
    global.location.assign(coursewareUrl);
  };

  const handleRedemptionError = () => {
    setConfirmationButtonState('error');
  };

  const {
    subsidyForCourse,
    courseRunPrice,
    redeem,
  } = useCourseUpgradeData({
    courseRunKey,
    mode,
    onRedeem: handleRedeem,
    onRedeemSuccess: handleRedemptionSuccess,
    onRedeemError: handleRedemptionError,
  });

  const handleClick = () => {
    setIsModalOpen(true);
    sendEnterpriseTrackEvent(
      enterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.dashboard.course_enrollment.upgrade_button.clicked',
    );
  };

  const handleEnroll = async (e) => {
    if (!subsidyForCourse || !redeem) {
      return;
    }
    await redeem(e);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setConfirmationButtonState('default');
  };

  return (
    <>
      <Button
        className={className}
        variant={variant}
        onClick={handleClick}
        data-testid="upgrade-course-button"
      >
        <FormattedMessage
          {...messages.upgradeButtonText}
          values={{
            s: getUpgradeButtonScreenReaderText,
            title,
          }}
        />
      </Button>
      <EnrollModal
        isModalOpen={isModalOpen}
        confirmationButtonState={confirmationButtonState}
        onClose={handleModalClose}
        enrollmentUrl={subsidyForCourse?.redemptionUrl}
        courseRunPrice={courseRunPrice}
        userSubsidyApplicableToCourse={subsidyForCourse}
        couponCodesCount={couponCodeRedemptionCount}
        onEnroll={handleEnroll}
      />
    </>
  );
};

UpgradeCourseButton.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.string,
  title: PropTypes.string.isRequired,
  courseRunKey: PropTypes.string.isRequired,
  mode: PropTypes.string.isRequired,
};

UpgradeCourseButton.defaultProps = {
  className: undefined,
  variant: 'outline-primary',
};

export default UpgradeCourseButton;
