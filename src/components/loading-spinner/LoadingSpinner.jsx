import React from 'react';
import PropTypes from 'prop-types';

import './styles/LoadingSpinner.scss';

function LoadingSpinner({ screenReaderText }) {
  return (
    <div className="loading-spinner d-flex justify-content-center align-items-center">
      <div className="spinner-border text-primary" role="status">
        <span className="sr-only">{screenReaderText}</span>
      </div>
    </div>
  );
}

LoadingSpinner.propTypes = {
  screenReaderText: PropTypes.string.isRequired,
};

export default LoadingSpinner;
