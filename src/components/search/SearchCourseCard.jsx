import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import Truncate from 'react-truncate';
import { Link } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import './styles/SearchCourseCard.scss';

const SearchCourseCard = ({ hit }) => {
  const { enterpriseConfig: { slug } } = useContext(AppContext);

  const course = useMemo(
    () => camelCaseObject(hit),
    [hit],
  );

  const primaryPartner = course.partners.length > 0 ? course.partners[0] : undefined;
  const showPartnerLogo = course.partners.length === 1;

  // FIXME: temporarily using the course image for "How to Learn Online" until Algolia is
  // aware of the correct course card images to be using.
  const temporaryDefaultCardImage = 'https://prod-discovery.edx-cdn.org/media/course/image/0e575a39-da1e-4e33-bb3b-e96cc6ffc58e-8372a9a276c1.png';

  return (
    <div
      className="discovery-card mb-4"
      role="group"
      aria-label={course.title}
    >
      <Link to={`/${slug}/course/${course.key}`}>
        <div className="card">
          <img
            className="card-img-top"
            src={course.cardImageUrl || temporaryDefaultCardImage}
            alt=""
          />
          {primaryPartner && showPartnerLogo && (
            <div className="partner-logo-wrapper">
              <img
                // FIXME: hardcoding the edX partner logo for now until Algolia is aware of partner logos
                src="https://prod-discovery.edx-cdn.org/organization/logos/4f8cb2c9-589b-4d1e-88c1-b01a02db3a9c-2b8dd916262f.png"
                className="partner-logo"
                alt={primaryPartner.name}
              />
            </div>
          )}
          <div className="card-body py-3">
            <h3 className="card-title h5 mb-1">
              <Truncate lines={3} trimWhitespace>
                {course.title}
              </Truncate>
            </h3>
            {course.partners.length > 0 && (
              <p className="partner text-muted m-0">
                <Truncate lines={1} trimWhitespace>
                  {course.partners.join(', ')}
                </Truncate>
              </p>
            )}
          </div>
          <div className="card-footer bg-white border-0 pt-0 pb-2">
            <span className="text-muted">Course</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

SearchCourseCard.propTypes = {
  hit: PropTypes.shape({
    key: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
};

export default SearchCourseCard;
