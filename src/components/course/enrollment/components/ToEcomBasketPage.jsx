import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { useSubsidyDataForCourse } from '../hooks';
import EnrollModal from '../../EnrollModal';

import { enrollLinkClass } from '../constants';
import { EnrollButtonCta } from '../common';

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

  return (
    <>
      <EnrollButtonCta
        enrollLabel={enrollLabel}
        className={classNames('d-block', enrollLinkClass)}
        onClick={() => setIsModalOpen(true)}
      />
      <EnrollModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        enrollmentUrl={enrollmentUrl}
        courseRunPrice={courseRunPrice}
        userSubsidyApplicableToCourse={userSubsidyApplicableToCourse}
        couponCodesCount={couponCodesCount}
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
