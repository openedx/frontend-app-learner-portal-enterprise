import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Badge, Card } from '@openedx/paragon';
import { useParams } from 'react-router-dom';
import capitalize from 'lodash.capitalize';

import { CONTENT_TYPES, IN_PROGRESS } from './constants';
import { linkToCourse, shortenString } from '../course/data/utils';

const PathwayNode = ({ node }) => {
  const { enterpriseSlug } = useParams();

  const linkToNode = useMemo(
    // eslint-disable-next-line consistent-return
    () => {
      if (node.contentType === CONTENT_TYPES.COURSE) {
        return linkToCourse(node, enterpriseSlug);
      }
      if (node.contentType === CONTENT_TYPES.PROGRAM) {
        return `/${enterpriseSlug}/program/${node.uuid}`;
      }
      return '#';
    },
    [node, enterpriseSlug],
  );

  const description = useMemo(
    () => shortenString(node.shortDescription, 250, '...'),
    [node],
  );

  return (
    <div className="pathway-node">
      <div className="row-cols-1 pathway-node-card">
        <Card className="w-100">
          <Card.Section>
            <div className="row d-flex align-items-center">
              <div className="col-3">
                <img src={node.cardImageUrl} alt={node.title} />
              </div>
              <div className="col-7">
                <div className="row">
                  <h3>{node.title}</h3>&nbsp;
                  {node.status === IN_PROGRESS && <Badge variant="success">In Progress</Badge>}
                </div>
                <p
                  className="row lead font-weight-normal"
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              </div>
              <div className="col-2">
                {
                  node.status === IN_PROGRESS ? (
                    <a href={linkToNode} type="button" className="btn btn-primary"> Resume {capitalize(node.contentType)}</a>
                  ) : (
                    <a href={linkToNode} type="button" className="btn btn-secondary"> View {capitalize(node.contentType)}</a>
                  )
                }
              </div>
            </div>
          </Card.Section>
        </Card>
      </div>
    </div>
  );
};

export default PathwayNode;

PathwayNode.propTypes = {
  node: PropTypes.shape({
    title: PropTypes.string,
    key: PropTypes.string,
    uuid: PropTypes.string,
    shortDescription: PropTypes.string,
    cardImageUrl: PropTypes.string,
    destinationUrl: PropTypes.string,
    contentType: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
};
