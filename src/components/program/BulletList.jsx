import React from 'react';
import PropTypes from 'prop-types';

function BulletList({ items }) {
  return (
    <ul>
      {items.map(item => (
        <li className="bullet-point mb-2" key={item}>
          {item}
        </li>
      ))}
    </ul>
  );
}

BulletList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default BulletList;
