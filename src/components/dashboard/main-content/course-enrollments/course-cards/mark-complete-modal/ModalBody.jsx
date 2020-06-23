import React, { useContext } from 'react';

import ModalError from './ModalError';
import MarkCompleteModalContext from './MarkCompleteModalContext';

const ModalBody = () => {
  const {
    confirmError,
    courseLink,
    courseTitle,
  } = useContext(MarkCompleteModalContext);
  return (
    <>
      {confirmError && <ModalError />}
      <p className="m-0">
        Are you sure you want to save
        {' '}
        <a href={courseLink}>{courseTitle}</a>
        {' '}
        for later? You will remain enrolled, but the course will
        no longer appear as &quot;In Progress&quot;.
      </p>
      <p className="mt-2">
        As long as your license is valid, you can resume the course by clicking
        &quot;Move course to In Progress&quot; under your list of courses saved for later.
      </p>
    </>
  );
};

export default ModalBody;
