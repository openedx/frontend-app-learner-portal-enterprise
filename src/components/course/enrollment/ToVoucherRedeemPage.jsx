import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { enrollLinkClass } from '../data/constants';
import { useSubsidyData } from '../data/hooks';
import EnrollModal from '../EnrollModal';
import { EnrollButtonCta } from './common';

/**
 * Voucher redeem page component implemention for Enroll Button.
 *
 * @param {Component} args.enrollLabel An EnrollLabel component
 * @returns {Component} Rendered enroll button with a enrollment modal behavior included.
 */
const ToVoucherRedeemPage = ({ enrollLabel }) => {
  const { courseHasOffer, offersCount, enrollmentUrl } = useSubsidyData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <EnrollButtonCta
        enrollLabel={enrollLabel}
        className={enrollLinkClass}
        onClick={() => setIsModalOpen(true)}
      />
      <EnrollModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        offersCount={offersCount}
        courseHasOffer={courseHasOffer}
        enrollmentUrl={enrollmentUrl}
      />
    </>
  );
};

ToVoucherRedeemPage.propTypes = { enrollLabel: PropTypes.shape.isRequired };

export default ToVoucherRedeemPage;
