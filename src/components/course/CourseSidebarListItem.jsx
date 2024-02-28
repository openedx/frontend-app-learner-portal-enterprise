import React from 'react';
import PropTypes from 'prop-types';
import { Col, Icon, Row } from '@openedx/paragon';

const CourseSidebarListItem = ({
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

CourseSidebarListItem.propTypes = {
  icon: PropTypes.shape().isRequired,
  label: PropTypes.string.isRequired,
  content: PropTypes.node.isRequired,
};

export default CourseSidebarListItem;
