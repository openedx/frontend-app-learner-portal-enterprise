import { useContext } from 'react';
import { Alert } from '@openedx/paragon';
import { Error } from '@openedx/paragon/icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import MarkCompleteModalContext from './MarkCompleteModalContext';

const ModalError = () => {
  const { courseLink, courseTitle } = useContext(MarkCompleteModalContext);
  return (
    <Alert variant="danger" icon={Error}>
      <FormattedMessage
        id="learner.portal.mark.complete.modal.error.message"
        defaultMessage="Unable to save {courseLink} for later. Please try again."
        description="Error message shown when saving a course for later fails"
        values={{
          courseLink: <Alert.Link href={courseLink}>{courseTitle}</Alert.Link>,
        }}
      />
    </Alert>
  );
};

export default ModalError;
