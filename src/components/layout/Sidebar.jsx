import React from 'react';
import PropTypes from 'prop-types';

function Sidebar(props) {
  return (
    <aside className="col-12 col-lg-4 pl-5" {...props}>
      {props.children}
    </aside>
  );
}

Sidebar.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Sidebar;
