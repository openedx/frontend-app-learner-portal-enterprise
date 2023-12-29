import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { v4 as uuidv4 } from 'uuid';

const ProgramPathwayOpportunity = ({ pathways, title, pathwayClass }) => (
  <div className={pathwayClass}>
    <h2 className="divider-heading"> { title } </h2>
    {pathways.map((pathway) => (
      <div key={uuidv4()} className="pathway-wrapper">
        <div className="pathway-info">
          <h2 className="pathway-heading"> { pathway.name } </h2>
          { pathway.description && <p> {pathway.description}</p> }
          { pathway.destinationUrl && (
            <div className="sidebar-button-wrapper">
              <a href={pathway.destinationUrl} className="pathway-link">
                <Button
                  variant="outline-primary"
                  className="btn pathway-button sidebar-button"
                  data-pathway-uuid={pathway.uuid}
                  data-pathway-name={pathway.name}
                >
                  Learn more
                </Button>
              </a>
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
);

export default ProgramPathwayOpportunity;

ProgramPathwayOpportunity.propTypes = {
  pathways: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    destinationUrl: PropTypes.string,
    uuid: PropTypes.string,
  })).isRequired,
  title: PropTypes.string.isRequired,
  pathwayClass: PropTypes.string.isRequired,
};
