import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, OverlayTrigger, Tooltip } from '@openedx/paragon';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import { useCouponCodes, useEnterpriseCustomer } from '../../../../app/data';
import { useCourseUpgradeData } from '../data';
import EnrollModal from '../../../../course/EnrollModal';

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
 * Button for upgrading a course via coupon code (possibly offer later on).
 */
const UpgradeCourseButton = ({
  className,
  title,
  variant,
  courseRunKey,
  mode,
}) => {
  const intl = useIntl();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { data: { couponCodeRedemptionCount } } = useCouponCodes();
  const {
    subsidyForCourse,
    courseRunPrice,
  } = useCourseUpgradeData({ courseRunKey, mode });

  const handleClick = () => {
    setIsModalOpen(true);
    sendEnterpriseTrackEvent(
      enterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.course.upgrade_button.clicked',
    );
  };
  const handleEnroll = () => {
    sendEnterpriseTrackEvent(
      enterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.course.upgrade_button.to_ecommerce_basket.clicked',
    );
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
          {/* {DIV IS NECESSARY TO AVOID A CSS STYLING COMPLEXITY
          WHERE THE TEXT'S WHITESPACE WILL DISAPPEAR, DO NOT REMOVE} */}
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
        setIsModalOpen={setIsModalOpen}
        enrollmentUrl={subsidyForCourse.redemptionUrl}
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
