import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Collapsible } from '@edx/paragon';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

import PathwayNode from './PathwayNode';

const PathwayStep = ({ index, minRequirements, nodes }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible
      title={`Requirement ${index}: Choose any ${minRequirements} of the following.`}
      open={isOpen}
      styling="card-lg"
      className="collapsible shadow-lg pathway-step"
      iconWhenOpen={<FontAwesomeIcon className="text-primary text-lg" icon={faChevronUp} size="1x" />}
      iconWhenClosed={<FontAwesomeIcon className="text-primary" icon={faChevronDown} size="1x" />}
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
  minRequirements: PropTypes.number.isRequired,
  nodes: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    imageUrl: PropTypes.string,
    destinationUrl: PropTypes.string,
    uuid: PropTypes.string,
    type: PropTypes.string,
  })).isRequired,
};
