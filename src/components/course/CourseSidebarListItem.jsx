import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function CourseSidebarListItem({
  icon,
  label,
  content,
}) {
  return (
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
}

CourseSidebarListItem.propTypes = {
  icon: PropTypes.shape().isRequired,
  label: PropTypes.string.isRequired,
  content: PropTypes.node.isRequired,
};
