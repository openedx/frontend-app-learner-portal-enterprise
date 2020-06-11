import React, { useContext } from 'react';
import { StatusAlert } from '@edx/paragon';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import UnarchiveModalContext from './UnarchiveModalContext';

const ModalError = () => {
  const { courseLink, courseTitle } = useContext(UnarchiveModalContext);
  return (
    <StatusAlert
      alertType="danger"
      dialog={(
        <div className="d-flex">
          <div>
            <FontAwesomeIcon className="mr-3" icon={faExclamationTriangle} />
          </div>
          <div>
            Failure un-archiving
            {' '}
            <a className="text-link" href={courseLink}>{courseTitle}</a>.
            {' '}
            Please try again.
          </div>
        </div>
      )}
      dismissible={false}
      open
    />
  );
};

export default ModalError;
