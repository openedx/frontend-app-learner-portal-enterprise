import React, { useContext } from 'react';

import { Alert } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { UserSubsidyContext } from '../enterprise-user-subsidy';

export const getOffersText = (number) => `You have ${number} course redemption voucher${number > 1 ? 's' : ''} left to use.`;

const OffersAlert = () => {
  const { offers } = useContext(UserSubsidyContext);

  if (offers.offersCount) {
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
  }
  return null;
};

export default OffersAlert;
