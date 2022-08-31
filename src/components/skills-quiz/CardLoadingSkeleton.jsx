import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardImg } from '@edx/paragon';
import Skeleton from 'react-loading-skeleton';
import { LOADING_NO_OF_CARDS } from './constants';

const CardLoadingSkeleton = () => (
  <div className="row col col-12 p-0">
    <div className="skill-quiz-results align-items-l-between col col-xl-10">
      {Array.from({ length: LOADING_NO_OF_CARDS }, (_, i) => (
        <div
          className="search-result-card mb-4"
          role="group"
          key={i}
        >
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <Link to="#">
            <Card>
              <CardImg
                as={Skeleton}
                variant="top"
                duration={0}
                height={100}
                data-testid="card-img-loading"
              />
              <div className="partner-logo-wrapper">
                <Skeleton width={90} height={42} data-testid="partner-logo-loading" />
              </div>
              <Card.Body>
                <Card.Header as="h4" className="card-title mb-2" title={<Skeleton count={2} data-testid="course-title-loading" />} />
                <Skeleton duration={0} data-testid="partner-name-loading" />
                <Skeleton count={1} data-testid="skills-loading" />
              </Card.Body>
            </Card>
          </Link>
        </div>
      ))}
    </div>
  </div>
);

export default CardLoadingSkeleton;
