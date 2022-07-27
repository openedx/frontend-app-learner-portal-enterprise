import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearchMinus } from '@fortawesome/free-solid-svg-icons';

import { PopularResults } from './popular-results';
import { getNoResultsMessage } from '../utils/search';

const SearchNoResults = ({ title }) => {
  const noResultsMessage = getNoResultsMessage(title);

  return (
    <>
      <Alert
        className="mb-5"
        variant="info"
        dismissible={false}
        icon={() => <FontAwesomeIcon icon={faSearchMinus} size="2x" />}
        show
      >
        <Alert.Heading>{noResultsMessage.messageTitle}</Alert.Heading>
        {noResultsMessage.messageContent}
      </Alert>
      <PopularResults title={title} />
    </>
  );
};

SearchNoResults.propTypes = {
  title: PropTypes.string.isRequired,
};

export default SearchNoResults;
