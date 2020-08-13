/* eslint-disable react/require-default-props */
import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '@edx/paragon';

import ButtonWithLink from '../../layout/ButtonWithLink';

import './styles/SidebarCard.scss';

const SidebarCard = ({
  title, children, buttonText, textClassNames = '', titleClassNames = '', linkIsLocal = false, buttonLink = '',
}) => (
  <Card className="shadow">
    <Card.Body>
      {title && <Card.Title className={titleClassNames}>{title}</Card.Title>}
      <Card.Text className={textClassNames}>
        {children}
      </Card.Text>
      {buttonText && <ButtonWithLink className="btn-primary btn-block" linkIsLocal={linkIsLocal} link={buttonLink} text={buttonText} />}
    </Card.Body>
  </Card>
);

SidebarCard.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  buttonText: PropTypes.string,
  textClassNames: PropTypes.string,
  titleClassNames: PropTypes.string,
  //  if the link is local, the current slug will be prepended to the text of the buttonLink
  linkIsLocal: PropTypes.bool.isRequired,
  buttonLink: PropTypes.string.isRequired,
};

export default SidebarCard;
