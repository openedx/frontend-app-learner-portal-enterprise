import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';

const SearchCourseCard = ({ hit }) => {
  const { enterpriseConfig: { slug } } = useContext(AppContext);

  const courseDetails = useMemo(
    () => {
      const { title, key } = hit;
      return { title, key };
    },
    [hit],
  );

  return (
    <Link to={`/${slug}/course/${courseDetails.key}`}>
      <p>{courseDetails.title}</p>
    </Link>
  );
};

SearchCourseCard.propTypes = {
  hit: PropTypes.shape({
    key: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
};

export default SearchCourseCard;
