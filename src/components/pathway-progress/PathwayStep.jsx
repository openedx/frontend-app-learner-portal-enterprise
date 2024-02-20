import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Collapsible, Icon } from '@edx/paragon';
import { ExpandLess, ExpandMore } from '@edx/paragon/icons';

import PathwayNode from './PathwayNode';

const PathwayStep = ({ index, nodes }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <Collapsible
      title={`Requirement ${index + 1}${nodes?.length > 1 ? `: Choose any ${nodes.length} of the following` : ''}`}
      open={isOpen}
      styling="card-lg"
      className="collapsible shadow-lg pathway-step"
      iconWhenOpen={<Icon src={ExpandLess} />}
      iconWhenClosed={<Icon src={ExpandMore} />}
      onToggle={() => setIsOpen((!isOpen))}
    >
      {
        nodes.map(node => <PathwayNode node={node} />)
      }
    </Collapsible>
  );
};

export default PathwayStep;

PathwayStep.propTypes = {
  index: PropTypes.number.isRequired,
  nodes: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    imageUrl: PropTypes.string,
    destinationUrl: PropTypes.string,
    uuid: PropTypes.string,
    type: PropTypes.string,
  })).isRequired,
};
