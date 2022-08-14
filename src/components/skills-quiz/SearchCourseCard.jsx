import React, {
  useContext, useMemo, useState, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { StatusAlert } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearchMinus } from '@fortawesome/free-solid-svg-icons';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { SkillsContext } from './SkillsContextProvider';

import { NO_COURSES_ALERT_MESSAGE } from './constants';
import { useSelectedSkillsAndJobSkills } from './data/hooks';
import { useDefaultSearchFilters } from '../search/data/hooks';
import { UserSubsidyContext } from '../enterprise-user-subsidy';
import CourseCard from './CourseCard';

const renderDialog = () => (
  <div className="lead d-flex align-items-center py-3">
    <div className="mr-3">
      <FontAwesomeIcon icon={faSearchMinus} size="2x" />
    </div>
    <p>
      { NO_COURSES_ALERT_MESSAGE }
    </p>
  </div>
);

const SearchCourseCard = ({ index }) => {
  const { enterpriseConfig } = useContext(AppContext);
  const { subscriptionPlan, offers: { offers } } = useContext(UserSubsidyContext);
  const offerCatalogs = offers.map((offer) => offer.catalog);
  const { filters } = useDefaultSearchFilters({
    enterpriseConfig,
    subscriptionPlan,
    offerCatalogs,
  });

  const { state } = useContext(SkillsContext);
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [hitCount, setHitCount] = useState(undefined);
  const { refinements } = useContext(SearchContext);
  const { skill_names: skills } = refinements;
  const { selectedJob } = state;
  // Top 3 Recommended courses are determined based on job-skills only, coming either from Search Job or Current Job
  const selectedJobSkills = useSelectedSkillsAndJobSkills({ getAllSkills: false });
  const skillsFacetFilter = useMemo(
    () => {
      if (selectedJobSkills) {
        return selectedJobSkills.map((skill) => `skill_names:${skill}`);
      }
      return [];
    },
    [selectedJob],
  );
  useEffect(
    () => {
      async function fetchCourses() {
        setIsLoading(true);
        const { hits, nbHits } = await index.search('', {
          filters: `content_type:course AND ${filters}`, // eslint-disable-line object-shorthand
          facetFilters: [
            skillsFacetFilter,
          ],
        });
        if (nbHits > 0) {
          setCourses(hits.length <= 3 ? camelCaseObject(hits) : camelCaseObject(hits.slice(0, 3)));
          setHitCount(nbHits);
          setIsLoading(false);
        } else {
          setHitCount(nbHits);
          setIsLoading(false);
        }
      }
      fetchCourses();
    },
    [selectedJob, skills],
  );

  return (
    <div>
      {(hitCount > 0) ? <h3 className="mt-2 mb-2"> Get started with these courses </h3> : null}
      <div className="skill-quiz-results">
        {(hitCount > 0) && courses.map(course => (
          <CourseCard isLoading={isLoading} course={course} allSkills={selectedJobSkills} />
        ))}
      </div>
      <div>
        { hitCount === 0 && (
          <StatusAlert
            className="mt-4 mb-5"
            alertType="info"
            dialog={renderDialog()}
            dismissible={false}
            open
          />
        )}
      </div>
    </div>
  );
};

SearchCourseCard.propTypes = {
  index: PropTypes.shape({
    appId: PropTypes.string,
    indexName: PropTypes.string,
    search: PropTypes.func.isRequired,
  }).isRequired,
};

export default SearchCourseCard;
