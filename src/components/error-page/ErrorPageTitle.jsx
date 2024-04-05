import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Individual title component of ErrorPage component parent.
 * Includes default styling for error pages.
 */
const ErrorPageTitle = ({
  children,
  className,
  spannedTitle,
}) => (
  <h2 className={classNames('text-danger mb-4', className)}>
    {children}
    {spannedTitle && (
      <>
        {' '}
        <span className="text-primary">
          {spannedTitle}
        </span>
      </>
    )}
  </h2>
);

ErrorPageTitle.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  spannedTitle: PropTypes.node,
};

ErrorPageTitle.defaultProps = {
  children: 'Error occurred while processing your request',
  className: undefined,
  spannedTitle: null,
};

export default ErrorPageTitle;
