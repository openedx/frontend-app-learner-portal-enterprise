import React, { useContext } from 'react';

import ModalError from './ModalError';
import UnarchiveModalContext from './UnarchiveModalContext';

const ModalBody = () => {
  const {
    confirmError,
    courseLink,
    courseTitle,
  } = useContext(UnarchiveModalContext);
  return (
    <>
      {confirmError && <ModalError />}
      <p className="m-0">
        Are you sure you want to unarchive
        {' '}
        <a href={courseLink}>{courseTitle}</a>
        {' '}
        The course will show up in your &quot;In Progress&quot; section.
      </p>
      <p className="mt-2">
        As long as your license is valid, you can resume the course by clicking &quot;Continue Learning&quot;.
      </p>
    </>
  );
};

export default ModalBody;
