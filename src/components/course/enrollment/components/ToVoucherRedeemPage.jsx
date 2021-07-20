import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { useSubsidyDataForCourse } from '../hooks';
import EnrollModal from '../../EnrollModal';

import { enrollLinkClass } from '../constants';
import { EnrollButtonCta } from '../common';

const ToVoucherRedeemPage = ({ enrollLabel, enrollmentUrl }) => {
  const { courseHasOffer, offersCount } = useSubsidyDataForCourse();
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
        offersCount={offersCount}
        courseHasOffer={courseHasOffer}
        enrollmentUrl={enrollmentUrl}
      />
    </>
  );
};
ToVoucherRedeemPage.propTypes = {
  enrollLabel: PropTypes.node.isRequired,
  enrollmentUrl: PropTypes.string.isRequired,
};

export default ToVoucherRedeemPage;
