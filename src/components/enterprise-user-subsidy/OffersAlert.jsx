import React from 'react';
import PropTypes from 'prop-types';

import { Alert, Container } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

export const getOffersText = (number) => `You have ${number} course redemption voucher${number > 1 ? 's' : ''} left to use.`;

const OffersAlert = ({ offers }) => {
  if (!offers.offersCount) {
    return null;
  }
  return (
    <Alert className="rounded-0" variant="info">
      <Container fluid>
        <FontAwesomeIcon className="mr-2" icon={faInfoCircle} />
        {getOffersText(offers.offersCount)}
      </Container>
    </Alert>
  );
};

OffersAlert.propTypes = {
  offers: PropTypes.shape({
    offersCount: PropTypes.number.isRequired,
  }).isRequired,
};

export default OffersAlert;
