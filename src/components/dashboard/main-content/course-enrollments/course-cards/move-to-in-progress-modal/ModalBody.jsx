import React, { useContext } from 'react';

import ModalError from './ModalError';
import MoveToInProgressModalContext from './MoveToInProgressModalContext';

const ModalBody = () => {
  const {
    confirmError,
    courseLink,
    courseTitle,
  } = useContext(MoveToInProgressModalContext);
  return (
    <>
      {confirmError && <ModalError />}
      <p className="m-0">
        Are you sure you want to move
        {' '}
        <a href={courseLink}>{courseTitle}</a>
        {' '}
        to &quot;In Progress&quot;? The course will show up in your &quot;In Progress&quot; section.
      </p>
      <p className="mt-2">
        As long as your license is valid, you can resume the course by clicking &quot;Move to In Progress&quot;.
      </p>
    </>
  );
};

export default ModalBody;
