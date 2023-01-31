import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from '@edx/paragon';
import { Warning } from '@edx/paragon/icons';
import { getSearchErrorMessage } from '../utils/search';

const SearchError = ({ title }) => {
  const searchErrorMessage = getSearchErrorMessage(title);

  return (
    <Alert
      variant="danger"
      dismissible={false}
      icon={Warning}
      open
    >
      <Alert.Heading>
        {searchErrorMessage.messageTitle}
      </Alert.Heading>
      {searchErrorMessage.messageContent}
    </Alert>
  );
};

SearchError.propTypes = {
  title: PropTypes.string.isRequired,
};

export default SearchError;
