import React from 'react';
import PropTypes from 'prop-types';

function FormSectionHeading({ children }) {
  return <h3 className="h4 mb-4">{children}</h3>;
}

FormSectionHeading.propTypes = {
  children: PropTypes.node.isRequired,
};

export default FormSectionHeading;
