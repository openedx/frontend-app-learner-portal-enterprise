import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Col, Row } from '@openedx/paragon';

const ProgramSidebarListItem = ({
  icon,
  label,
  content,
}) => (
  <Row as="li" className="d-flex align-items-start border-bottom py-3">
    <Col className="d-flex align-items-center">
      <Icon className="mr-3" src={icon} />
      <span>{label}:</span>
    </Col>
    <Col>
      {content}
    </Col>
  </Row>
);

ProgramSidebarListItem.propTypes = {
  icon: PropTypes.shape().isRequired,
  label: PropTypes.string.isRequired,
  content: PropTypes.node.isRequired,
};

export default ProgramSidebarListItem;
