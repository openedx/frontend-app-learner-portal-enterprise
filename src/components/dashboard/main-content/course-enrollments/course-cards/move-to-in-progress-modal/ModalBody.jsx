import { useContext } from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

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
        <FormattedMessage
          id="learner.portal.move.to.in.progress.modal.body.confirmation.part1"
          defaultMessage="Are you sure you want to move {courseLink} to &quot;In Progress&quot;? The course will show up in your &quot;In Progress&quot; section."
          description="First part of the confirmation message for moving a course to in progress"
          values={{
            courseLink: <a href={courseLink}>{courseTitle}</a>,
          }}
        />
      </p>
      <p className="mt-2">
        <FormattedMessage
          id="learner.portal.move.to.in.progress.modal.body.confirmation.part2"
          defaultMessage="As long as your license is valid, you can resume the course by clicking &quot;Move to In Progress&quot;."
          description="Second part of the confirmation message"
        />
      </p>
    </>
  );
};

export default ModalBody;
