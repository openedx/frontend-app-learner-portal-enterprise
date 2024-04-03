import React from 'react';
import PropTypes from 'prop-types';

const MainContent = props => (
  <article className="col-12 col-lg-8">
    {props.children}
  </article>
);

MainContent.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MainContent;
