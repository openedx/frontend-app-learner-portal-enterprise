import React from 'react';
import PropTypes from 'prop-types';

const Sidebar = props => (
  <aside className="col-12 col-lg-4 pl-5" {...props}>
    {props.children}
  </aside>
);

Sidebar.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Sidebar;
