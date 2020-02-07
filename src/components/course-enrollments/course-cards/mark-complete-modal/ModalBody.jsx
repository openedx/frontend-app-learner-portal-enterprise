import React, { useContext } from 'react';

import { MarkCompleteModalContext } from './MarkCompleteModal';
import ModalError from './ModalError';

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
        Are you sure you want to mark
        {' '}
        <a href={courseLink}>{courseTitle}</a>
        {' '}
        as complete?
      </p>
    </>
  );
};

export default ModalBody;
