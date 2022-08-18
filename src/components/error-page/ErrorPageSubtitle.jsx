import PropTypes from 'prop-types';

/**
 * Individual subtitle component of ErrorPage component parent.
 * Includes default styling for error pages.
 */
const ErrorPageSubtitle = ({ children }) => (
  <h3 className="mb-4.5 text-gray-700">{children}</h3>
);

ErrorPageSubtitle.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorPageSubtitle;
