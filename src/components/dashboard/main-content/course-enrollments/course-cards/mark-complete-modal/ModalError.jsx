import React, { useContext } from 'react';
import { Alert } from '@edx/paragon';
import { Error } from '@edx/paragon/icons';

import MarkCompleteModalContext from './MarkCompleteModalContext';

const ModalError = () => {
  const { courseLink, courseTitle } = useContext(MarkCompleteModalContext);
  return (
    <Alert variant="danger" icon={Error}>
      Unable to save <Alert.Link href={courseLink}>{courseTitle}</Alert.Link> for later. Please try again.
    </Alert>
  );
};

export default ModalError;
