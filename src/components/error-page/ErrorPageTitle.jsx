import PropTypes from 'prop-types';

/**
 * Individual title component of ErrorPage component parent.
 * Includes default styling for error pages.
 */
const ErrorPageTitle = ({ children, spannedTitle }) => (
  <h2 className="text-danger mb-4">
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
};

ErrorPageTitle.defaultProps = {
  children: 'Error occurred while processing your request',
};

export default ErrorPageTitle;
