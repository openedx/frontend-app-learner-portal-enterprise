import { useContext } from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

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
        <FormattedMessage
          id="learner.portal.mark.complete.modal.body.confirmation.part1"
          defaultMessage="Are you sure you want to save {courseLink} for later? You will remain enrolled, but the course will no longer appear as &quot;In Progress&quot;."
          description="First part of the confirmation message for saving a course for later"
          values={{
            courseLink: <a href={courseLink}>{courseTitle}</a>,
          }}
        />
      </p>
      <p className="mt-2">
        <FormattedMessage
          id="learner.portal.mark.complete.modal.body.confirmation.part2"
          defaultMessage="As long as your license is valid, you can resume the course by clicking &quot;Move course to In Progress&quot; under your list of courses saved for later."
          description="Second part of the confirmation message explaining how to resume the course"
        />
      </p>
    </>
  );
};

export default ModalBody;
