import PropTypes from 'prop-types';
import { Spinner } from '@edx/paragon';
import classNames from 'classnames';
import { useEffect, useState } from 'react';

const DelayedFallbackContainer = ({
  delay,
  className,
  children,
}) => {
  const [displayComponent, setDisplayComponent] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => setDisplayComponent(true), delay);
    return () => {
      clearTimeout(timeout);
    };
  }, [delay]);

  if (displayComponent) {
    return (
      <div
        className={classNames(className)}
        data-testid="delayed-fallback-container"
      >
        {children}
      </div>
    );
  }

  return null;
};

const defaultSpinner = <Spinner animation="border" screenReaderText="loading" data-testid="suspense-spinner" />;

DelayedFallbackContainer.propTypes = {
  delay: PropTypes.number,
  className: PropTypes.string,
  children: PropTypes.node,
};

DelayedFallbackContainer.defaultProps = {
  delay: 300,
  className: null,
  children: defaultSpinner,
};

export default DelayedFallbackContainer;
