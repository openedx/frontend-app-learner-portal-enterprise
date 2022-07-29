import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '@edx/paragon';

function PathwayNode({ node }) {
  return (
    <div className="pathway-node">
      <div className="row-cols-1 pathway-node-card">
        <Card className="w-100">
          <Card.Section>
            <div className="row d-flex align-items-center">
              <div className="col-3">
                <img src={node.imageUrl} alt={node.title} />
              </div>
              <div className="col-7">
                <h3 className="row">{node.title}</h3>
                <p className="row">{node.description}</p>
              </div>
              <div className="col-2">
                {
                  node.isInProgress ? (
                    <button type="button" className="btn-primary"> Resume {node.type}</button>
                  ) : (
                    <button type="button" className="btn-secondary"> View {node.type}</button>
                  )
                }
              </div>
            </div>
          </Card.Section>
        </Card>
      </div>
    </div>
  );
}

export default PathwayNode;

PathwayNode.propTypes = {
  node: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    imageUrl: PropTypes.string,
    destinationUrl: PropTypes.string,
    uuid: PropTypes.string,
    type: PropTypes.string,
    isInProgress: PropTypes.bool,
  }).isRequired,
};
