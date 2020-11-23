/* eslint-disable react/require-default-props */
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const ButtonWithLink = ({
  text, link, className = 'btn',
}) => {
  const finalLink = link;
  return (
    <Link to={finalLink} className={`btn ${className}`}>{text}</Link>
  );
};

ButtonWithLink.propTypes = {
  text: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default ButtonWithLink;
