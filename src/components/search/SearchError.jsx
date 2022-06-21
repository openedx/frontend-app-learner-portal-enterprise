import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Alert } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { getSearchErrorMessage } from '../utils/search';

const SearchError = ({ title }) => {
  const searchErrorMessage = getSearchErrorMessage(title);
  const renderDialog = useCallback(
    () => (
      <div className="lead d-flex align-items-center py-3">
        <Alert.Heading>
          {searchErrorMessage.messageTitle}
        </Alert.Heading>
        {searchErrorMessage.messageContent}
      </div>
    ),
    [],
  );

  return (
    <Alert
      variant="danger"
      dismissible={false}
      icon={() => <FontAwesomeIcon icon={faExclamationTriangle} size="2x" />}
      open
    >
      {renderDialog()}
    </Alert>
  );
};

SearchError.propTypes = {
  title: PropTypes.string.isRequired,
};

export default SearchError;
