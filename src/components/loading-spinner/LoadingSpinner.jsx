import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const LOADING_TIMEOUT_DELAY = 100;

const LoadingSpinner = ({
  screenReaderText,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(
    () => {
      setTimeout(() => {
        setIsVisible(true);
      }, LOADING_TIMEOUT_DELAY);
    },
    [],
  );

  if (!isVisible) {
    return null;
  }

  return (
    <div className="d-flex justify-content-center align-items-center">
      <div className="spinner-border text-primary" role="status">
        <span className="sr-only">{screenReaderText}</span>
      </div>
    </div>
  );
};

LoadingSpinner.propTypes = {
  screenReaderText: PropTypes.string.isRequired,
};

export default LoadingSpinner;
