import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import Truncate from 'react-truncate';
import Skeleton from 'react-loading-skeleton';
// import { camelCaseObject } from '@edx/frontend-platform/utils';
import { Card } from '@edx/paragon';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';

const SearchJobCard = ({ hit, isLoading }) => { // eslint-disable-line no-unused-vars
  const { refinementsFromQueryParams } = useContext(SearchContext);
  const { skill_names: skills } = refinementsFromQueryParams;

  // This statement will be usable once we have jobs data available in Algolia
  // Currently we are showing skills data in place of that, 'hit' will be passed as props to SearchJobCard
  // const job = hit ? camelCaseObject(hit) : {};

  return (
    <>
      {skills?.map(result => (
        <div
          key={result}
          className="search-job-card mb-3"
          role="group"
          aria-label={result}
        >
          <Card>
            <Card.Body>
              <Card.Title as="h4" className="card-title mb-1">
                {isLoading ? (
                  <Skeleton count={1} />
                ) : (
                  <Truncate lines={1} trimWhitespace>
                    {result}
                  </Truncate>
                )}
              </Card.Title>
              {isLoading ? (
                <Skeleton duration={0} />
              ) : (
                <>
                  <p className="text-muted m-0">
                    <Truncate lines={1} trimWhitespace>
                      {result}
                    </Truncate>
                  </p>
                </>
              )}
            </Card.Body>
          </Card>
        </div>
      ))}
    </>
  );
};

const SkeletonJobCard = (props) => (
  <SearchJobCard {...props} isLoading />
);

SearchJobCard.propTypes = {
  hit: PropTypes.shape({
    key: PropTypes.string,
    title: PropTypes.string,
    medianSalary: PropTypes.string,
    jobPostings: PropTypes.string,
  }),
  isLoading: PropTypes.bool,
};

SearchJobCard.defaultProps = {
  hit: undefined,
  isLoading: false,
};

SearchJobCard.Skeleton = SkeletonJobCard;

export default SearchJobCard;
