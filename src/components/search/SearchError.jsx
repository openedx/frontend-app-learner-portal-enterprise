import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { StatusAlert } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const SearchError = ({ title }) => {
  const lowerCaseTitle = title.toLowerCase();
  const renderDialog = useCallback(
    () => (
      <div className="lead d-flex align-items-center py-3">
        <div className="mr-3">
          <FontAwesomeIcon icon={faExclamationTriangle} size="2x" />
        </div>
        <div>
          An error occured while finding {lowerCaseTitle} that match your search.
          <br />
          Please try again later.
        </div>
      </div>
    ),
    [],
  );

  return (
    <StatusAlert
      alertType="danger"
      dialog={renderDialog()}
      dismissible={false}
      open
    />
  );
};

SearchError.propTypes = {
  title: PropTypes.string.isRequired,
};

export default SearchError;
