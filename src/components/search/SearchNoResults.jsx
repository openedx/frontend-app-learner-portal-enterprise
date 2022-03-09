import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { StatusAlert } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearchMinus } from '@fortawesome/free-solid-svg-icons';

import { PopularResults } from './popular-results';
import { getNoResultsMessage } from '../utils/search';

const SearchNoResults = ({ title }) => {
  const noResultsMessage = getNoResultsMessage(title);
  const renderDialog = useCallback(
    () => (
      <div className="lead d-flex align-items-center py-3">
        <div className="mr-3">
          <FontAwesomeIcon icon={faSearchMinus} size="2x" />
        </div>
        <div>
          {noResultsMessage.messageTitle}
          <br />
          {noResultsMessage.messageContent}
        </div>
      </div>
    ),
    [],
  );

  return (
    <>
      <StatusAlert
        className="mb-5"
        alertType="info"
        dialog={renderDialog()}
        dismissible={false}
        open
      />
      <PopularResults title={title} />
    </>
  );
};

SearchNoResults.propTypes = {
  title: PropTypes.string.isRequired,
};

export default SearchNoResults;
