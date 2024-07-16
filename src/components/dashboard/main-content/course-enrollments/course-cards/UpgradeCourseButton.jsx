import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { FormattedMessage, defineMessages } from '@edx/frontend-platform/i18n';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import EnrollModal from '../../../../course/EnrollModal';
import {
  COUPON_CODE_SUBSIDY_TYPE,
  ENTERPRISE_OFFER_SUBSIDY_TYPE,
  useCouponCodes,
  useEnterpriseCustomer,
} from '../../../../app/data';
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
    if ([COUPON_CODE_SUBSIDY_TYPE, ENTERPRISE_OFFER_SUBSIDY_TYPE].includes(subsidyForCourse?.subsidyType)) {
      sendEnterpriseTrackEvent(
        enterpriseCustomer.uuid,
        'edx.ui.enterprise.learner_portal.course.upgrade_button.to_ecommerce_basket.clicked',
      );
    } else {
      sendEnterpriseTrackEvent(
        enterpriseCustomer.uuid,
        'edx.ui.enterprise.learner_portal.course.upgrade_button.course_enrollment.upgraded',
      );
    }
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
        setIsModalOpen={setIsModalOpen}
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
