import { useContext } from 'react';
import { Alert } from '@openedx/paragon';
import { Error } from '@openedx/paragon/icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import MoveToInProgressModalContext from './MoveToInProgressModalContext';

const ModalError = () => {
  const { courseLink, courseTitle } = useContext(MoveToInProgressModalContext);
  return (
    <Alert variant="danger" icon={Error}>
      <FormattedMessage
        id="learner.portal.move.to.in.progress.modal.error.message"
        defaultMessage="An error occurred while unarchiving {courseLink}. Please try again."
        description="Error message shown when unarchiving/moving a course to in progress fails"
        values={{
          courseLink: <Alert.Link href={courseLink}>{courseTitle}</Alert.Link>,
        }}
      />
    </Alert>
  );
};

export default ModalError;
