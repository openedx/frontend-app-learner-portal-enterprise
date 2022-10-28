import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ProgramSidebarListItem = ({
  icon,
  label,
  content,
}) => (
  <Row as="li" className="d-flex align-items-start border-bottom py-3">
    <Col className="d-flex align-items-center">
      <FontAwesomeIcon className="mr-3" icon={icon} />
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
