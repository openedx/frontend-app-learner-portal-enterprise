import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { StatusAlert } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { getSearchErrorMessage } from '../utils/search';

const SearchError = ({ title }) => {
  const searchErrorMessage = getSearchErrorMessage(title);
  const renderDialog = useCallback(
    () => (
      <div className="lead d-flex align-items-center py-3">
        <div className="mr-3">
          <FontAwesomeIcon icon={faExclamationTriangle} size="2x" />
        </div>
        <div>
          {searchErrorMessage.messageTitle}
          <br />
          {searchErrorMessage.messageContent}
        </div>
      </div>
    ),
    [searchErrorMessage.messageContent, searchErrorMessage.messageTitle],
  );

  // TODO: Design Debt. Replace with `Alert` from @edx/paragon.
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
