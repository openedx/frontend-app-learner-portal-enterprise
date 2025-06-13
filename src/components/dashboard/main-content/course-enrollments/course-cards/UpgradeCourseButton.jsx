import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, OverlayTrigger, Tooltip } from '@openedx/paragon';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import { useCouponCodes, useEnterpriseCustomer } from '../../../../app/data';
import EnrollModal from '../../../../course/EnrollModal';
import { useCourseUpgradeData } from '../data';

const messages = defineMessages({
  overlayTextCoveredByOrganization: {
    id: 'enterprise.learner_portal.dashbboard.enrollments.course.upgrade.overlay.text.covered_by_organization',
    defaultMessage: 'Covered by your organization',
    description: 'The label for the course upgrade button overlay text',
  },
  upgradeForFreeButton: {
    id: 'enterprise.learner_portal.dashbboard.enrollments.course.upgrade.button.text',
    defaultMessage: 'Upgrade<s>{title}</s> for free',
    description: 'The label for the course upgrade button text',
  },
});

const upgradeButtonScreenReaderText = (chunks) => <span className="sr-only">{chunks}</span>;

const OverlayTriggerWrapper = ({ courseRunKey, hasCourseRunPrice, children }) => {
  const intl = useIntl();

  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { hideCourseOriginalPrice } = enterpriseCustomer;

  /* If the hideCourseOriginalPrice price flag is false OR there is a courseRunPrice,
  we want to display the button without the overlay text since the
  `renderCourseInfoOutline` component will display course price within
  the InProgressCourseCard component */
  if (!hideCourseOriginalPrice || hasCourseRunPrice) {
    return (
      <div>
        {children}
      </div>
    );
  }
  return (
    <OverlayTrigger
      placement="top"
      overlay={(
        <Tooltip variant="light" id={`upgradeCTA-tooltip-${courseRunKey}`}>
          {intl.formatMessage(messages.overlayTextCoveredByOrganization)}
        </Tooltip>
      )}
    >
      {children}
    </OverlayTrigger>
  );
};

OverlayTriggerWrapper.propTypes = {
  courseRunKey: PropTypes.string.isRequired,
  hasCourseRunPrice: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
};

/**
 * Button for upgrading a course via coupon code or learner credit.
 */
const UpgradeCourseButton = ({
  className,
  title,
  variant,
  courseRunKey,
  mode,
  enrollBy,
}) => {
  const intl = useIntl();
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
    enrollBy,
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
      <OverlayTriggerWrapper courseRunKey={courseRunKey} hasCourseRunPrice={!!courseRunPrice}>
        <Button
          className={className}
          variant={variant}
          onClick={handleClick}
          data-testid="upgrade-course-button"
        >
          {/* Note: the below `div` wrapping the i18n message below is necessary to avoid a CSS style issue
          where the screenreader-only text styles causes a lack of space between 2 words; `.sr-only` class name
          should must not be rendered within a flexbox container. */}
          <div>
            {intl.formatMessage(messages.upgradeForFreeButton, {
              s: upgradeButtonScreenReaderText,
              title,
            })}
          </div>
        </Button>
      </OverlayTriggerWrapper>
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
  enrollBy: PropTypes.string,
};

UpgradeCourseButton.defaultProps = {
  className: undefined,
  variant: 'outline-primary',
  enrollBy: undefined,
};

export default UpgradeCourseButton;
