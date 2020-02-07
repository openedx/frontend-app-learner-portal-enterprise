import React, { useContext } from 'react';
import { StatusAlert } from '@edx/paragon';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { MarkCompleteModalContext } from './MarkCompleteModal';

const ModalError = () => {
  const { courseLink, courseTitle } = useContext(MarkCompleteModalContext);
  return (
    <StatusAlert
      alertType="danger"
      dialog={
        <div className="d-flex">
          <div>
            <FontAwesomeIcon className="mr-3" icon={faExclamationTriangle} />
          </div>
          <div>
            Unable to mark
            {' '}
            <a className="text-link" href={courseLink}>{courseTitle}</a>
            {' '}
            as complete. Please try again.
          </div>
        </div>
      }
      dismissible={false}
      open
    />
  );
};

export default ModalError;
