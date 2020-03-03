import React from 'react';
import PropTypes from 'prop-types';

export default function PreviewExpand({
  children,
}) {
  return <div>{children}</div>;
}

PreviewExpand.propTypes = {
  children: PropTypes.element.isRequired,
};
