import PropTypes from 'prop-types';
import { Spinner } from '@edx/paragon';
import { useEffect, useState } from 'react';

/**
 * DelayedFallbackContainer is a component that delays the rendering of its children.
 * It waits for a specified delay before rendering the fallback UI, which is typically used
 * to display a loading indicator. This can prevent a loading spinner from flashing briefly
 * on the screen.
 *
 * @component
 * @param {object} props
 * @param {number} props.delay - The amount of time in milliseconds to wait before showing the fallback.
 * @param {string} [props.className] - An optional CSS class to apply to the container element.
 * @param {React.ReactNode} [props.children] - The content to be rendered after the delay.
 * @returns {React.ReactNode} - A container that either renders the fallback UI or the passed children after a delay.
 */
const DelayedFallbackContainer = ({
  delay,
  className,
  children,
}) => {
  const [shouldDisplayFallback, setShouldDisplayFallback] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => setShouldDisplayFallback(true), delay);
    return () => {
      clearTimeout(timeout);
    };
  }, [delay]);

  if (!shouldDisplayFallback) {
    return null;
  }

  return (
    <div
      className={className}
      data-testid="delayed-fallback-container"
    >
      {children || <Spinner animation="border" screenReaderText="loading" data-testid="suspense-spinner" />}
    </div>
  );
};

DelayedFallbackContainer.propTypes = {
  delay: PropTypes.number,
  className: PropTypes.string,
  children: PropTypes.node,
};

DelayedFallbackContainer.defaultProps = {
  delay: 300,
  className: undefined,
  children: null,
};

export default DelayedFallbackContainer;
