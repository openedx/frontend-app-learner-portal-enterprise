import { ActionRow, AlertModal, Button } from '@edx/paragon';
import PropTypes from 'prop-types';

const ClosingAlert = ({ navigateToSearchPage, hideCloseAlert, showAlert }) => (
  <AlertModal
    title="Exit Skills builder?"
    isOpen={showAlert}
    onClose={hideCloseAlert}
    footerNode={(
      <ActionRow className="mb-3.5">
        <Button variant="tertiary" onClick={hideCloseAlert}>Back to Skills builder</Button>
        <Button variant="primary" onClick={navigateToSearchPage}>Exit</Button>
      </ActionRow>
    )}
  >
    <p>
      Learners who enroll in courses that align with their career goals are more likely to complete the course.
    </p>
  </AlertModal>
);
ClosingAlert.propTypes = {
  navigateToSearchPage: PropTypes.func.isRequired,
  hideCloseAlert: PropTypes.func.isRequired,
  showAlert: PropTypes.bool.isRequired,
};

export default ClosingAlert;
