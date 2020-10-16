import React from 'react';
import PropTypes from 'prop-types';

import { Alert } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

export const getOffersText = (number) => `You have ${number} course redemption voucher${number > 1 ? 's' : ''} left to use.`;

const OffersAlert = ({ offers }) => {
  if (!offers.offersCount) {
    return null;
  }
  return (
    <Alert
      className="pl-5"
      variant="info"
    >
      <div className="container">
        <FontAwesomeIcon className="mr-1" icon={faInfoCircle} />
        {getOffersText(offers.offersCount)}
      </div>
    </Alert>
  );
};

OffersAlert.propTypes = {
  offers: PropTypes.shape({
    offersCount: PropTypes.number.isRequired,
  }).isRequired,
};

export default OffersAlert;
