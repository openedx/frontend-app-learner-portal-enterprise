import React, { useContext } from 'react';
import { Alert } from '@edx/paragon';
import { Error } from '@edx/paragon/icons';

import MoveToInProgressModalContext from './MoveToInProgressModalContext';

const ModalError = () => {
  const { courseLink, courseTitle } = useContext(MoveToInProgressModalContext);
  return (
    <Alert variant="danger" icon={Error}>
      An error occurred while unarchiving <Alert.Link href={courseLink}>{courseTitle}</Alert.Link>. Please try again.
    </Alert>
  );
};

export default ModalError;
