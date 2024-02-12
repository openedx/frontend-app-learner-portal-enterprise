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
  return (
    <div
      className={classNames(className)}
    >
      {displayComponent && children}
    </div>
  );
};

const defaultSpinner = <Spinner animation="border" screenReaderText="loading" />;

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
