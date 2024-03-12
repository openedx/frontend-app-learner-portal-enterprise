import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import EnrollModal from '../../../../course/EnrollModal';
import { UpgradeableCourseEnrollmentContext } from '../UpgradeableCourseEnrollmentContextProvider';
import { UserSubsidyContext } from '../../../../enterprise-user-subsidy';
import { useEnterpriseCustomer } from '../../../../app/data';

/**
 * Button for upgrading a course via coupon code (possibly offer later on).
 */
const UpgradeCourseButton = ({
  className,
  title,
  variant,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { couponCodes: { couponCodes } } = useContext(UserSubsidyContext);
  const {
    subsidyForCourse,
    couponUpgradeUrl,
    courseRunPrice,
  } = useContext(UpgradeableCourseEnrollmentContext);

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
      <Button
        className={className}
        variant={variant}
        onClick={handleClick}
        data-testid="upgrade-course-button"
      >
        Upgrade
        <span className="sr-only">for {title}</span>
      </Button>
      <EnrollModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        enrollmentUrl={couponUpgradeUrl}
        courseRunPrice={courseRunPrice}
        userSubsidyApplicableToCourse={subsidyForCourse}
        couponCodesCount={couponCodes.length}
        onEnroll={handleEnroll}
      />
    </>
  );
};

UpgradeCourseButton.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.string,
  title: PropTypes.string.isRequired,
};

UpgradeCourseButton.defaultProps = {
  className: undefined,
  variant: 'outline-primary',
};

export default UpgradeCourseButton;
