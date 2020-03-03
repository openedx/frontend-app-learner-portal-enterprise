import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function CourseSidebarListItem({
  icon,
  label,
  content,
}) {
  return (
    <li className="row d-flex align-items-start border-bottom no-gutters py-3">
      <div className="col d-flex align-items-center">
        <FontAwesomeIcon className="mr-3" icon={icon} />
        <span>{label}:</span>
      </div>
      <div className="col">
        {content}
      </div>
    </li>
  );
}

CourseSidebarListItem.propTypes = {
  icon: PropTypes.shape({}).isRequired,
  label: PropTypes.string.isRequired,
  content: PropTypes.node.isRequired,
};
