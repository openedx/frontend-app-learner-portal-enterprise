import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { useSubsidyDataForCourse } from '../hooks';
import EnrollModal from '../../EnrollModal';

import { enrollLinkClass } from '../constants';
import { EnrollButtonCta } from '../common';

const ToVoucherRedeemPage = ({ enrollLabel }) => {
  const { courseHasOffer, offersCount, enrollmentUrl } = useSubsidyDataForCourse();
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
