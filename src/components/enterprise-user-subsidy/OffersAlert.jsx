import React, { useContext } from 'react';

import { Alert, Container } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { UserSubsidyContext } from '.';

export const getOffersText = (number) => `You have ${number} enrollment codes${number > 1 ? 's' : ''} left to use.`;

const OffersAlert = () => {
  const { offers } = useContext(UserSubsidyContext);
  if (!offers?.offersCount) {
    return null;
  }
  return (
    <Alert className="rounded-0" variant="info">
      <Container size="lg">
        <FontAwesomeIcon className="mr-2" icon={faInfoCircle} />
        {getOffersText(offers.offersCount)}
      </Container>
    </Alert>
  );
};

export default OffersAlert;
