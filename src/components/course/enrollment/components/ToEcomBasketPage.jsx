import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';

import { useSubsidyDataForCourse } from '../hooks';
import EnrollModal from '../../EnrollModal';

import { EnrollButtonCta } from '../common';
import { CourseContext } from '../../CourseContextProvider';
import {
  useOptimizelyEnrollmentClickHandler,
  useTrackSearchConversionClickHandler,
} from '../../data/hooks';

/**
 * ToEcom page component implemention for Enroll Button.
 * Currently the same as the ToVoucherRedeemPage but keeping separate for cleanliness.
 *
 * @param {Component} args.enrollLabel An EnrollLabel component
 * @returns {Component} Rendered enroll button with a enrollment modal behavior included.
 */
const ToEcomBasketPage = ({ enrollLabel, enrollmentUrl, courseRunPrice }) => {
  const { userSubsidyApplicableToCourse, couponCodesCount } = useSubsidyDataForCourse();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    state: {
      activeCourseRun: { key: courseRunKey },
      userEnrollments,
    },
  } = useContext(CourseContext);

  const analyticsHandler = useTrackSearchConversionClickHandler({
    href: enrollmentUrl,
    eventName: 'edx.ui.enterprise.learner_portal.course.enroll_button.to_ecommerce_basket.clicked',
  });

  const optimizelyHandler = useOptimizelyEnrollmentClickHandler({
    href: enrollmentUrl,
    courseRunKey,
    userEnrollments,
  });

  const handleEnroll = (e) => {
    analyticsHandler(e);
    optimizelyHandler(e);
  };

  return (
    <>
      <EnrollButtonCta
        enrollLabel={enrollLabel}
        onClick={() => setIsModalOpen(true)}
        block
      />
      <EnrollModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        enrollmentUrl={enrollmentUrl}
        courseRunPrice={courseRunPrice}
        userSubsidyApplicableToCourse={userSubsidyApplicableToCourse}
        couponCodesCount={couponCodesCount}
        onEnroll={handleEnroll}
      />
    </>
  );
};

ToEcomBasketPage.propTypes = {
  enrollLabel: PropTypes.node.isRequired,
  enrollmentUrl: PropTypes.string.isRequired,
  courseRunPrice: PropTypes.number.isRequired,
};

export default ToEcomBasketPage;
