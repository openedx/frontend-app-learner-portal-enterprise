/* eslint-disable react/require-default-props */
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';

const ButtonWithLink = ({
  text, linkIsLocal = false, link, className = 'btn',
}) => {
  const { enterpriseConfig: { slug } } = useContext(AppContext);
  const finalLink = linkIsLocal ? `${slug}${link}` : link;
  return (
    <Link to={finalLink} className={`btn ${className}`}>{text}</Link>
  );
};

ButtonWithLink.propTypes = {
  text: PropTypes.string.isRequired,
  //  if the link is local, the current slug will be prepended to the text of the link
  linkIsLocal: PropTypes.bool,
  link: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default ButtonWithLink;
