import React, {
  useContext, useMemo, useState, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import { AppContext } from '@edx/frontend-platform/react';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { Alert, CardGrid } from '@openedx/paragon';
import { ZoomOut } from '@openedx/paragon/icons';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { SkillsContext } from './SkillsContextProvider';

import { NO_COURSES_ALERT_MESSAGE } from './constants';
import { useSelectedSkillsAndJobSkills } from './data/hooks';
import { useDefaultSearchFilters, useSearchCatalogs } from '../search/data/hooks';
import { UserSubsidyContext } from '../enterprise-user-subsidy';
import CourseCard from './CourseCard';
import { SubsidyRequestsContext } from '../enterprise-subsidy-requests';

const SearchCourseCard = ({ index }) => {
  const { enterpriseConfig } = useContext(AppContext);
  const {
    subscriptionPlan,
    subscriptionLicense,
    couponCodes: { couponCodes },
    enterpriseOffers,
    redeemableLearnerCreditPolicies,
  } = useContext(UserSubsidyContext);
  const { catalogsForSubsidyRequests } = useContext(SubsidyRequestsContext);

  const searchCatalogs = useSearchCatalogs({
    subscriptionPlan,
    subscriptionLicense,
    couponCodes,
    enterpriseOffers,
    catalogsForSubsidyRequests,
    redeemableLearnerCreditPolicies,
  });

  const { filters } = useDefaultSearchFilters({
    enterpriseConfig,
    searchCatalogs,
  });

  const { state } = useContext(SkillsContext);
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [hitCount, setHitCount] = useState(undefined);
  const { refinements } = useContext(SearchContext);
  const { skill_names: skills } = refinements;
  const { selectedJob, enrolledCourseIds } = state;
  // Top 3 Recommended courses are determined based on job-skills only, coming either from Search Job or Current Job
  const selectedJobSkills = useSelectedSkillsAndJobSkills({ getAllSkills: false });
  const skillsFacetFilter = useMemo(
    () => {
      if (selectedJobSkills) {
        return selectedJobSkills.map((skill) => `skill_names:${skill}`);
      }
      return [];
    },
    [selectedJobSkills],
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
          const hitsCamelCased = camelCaseObject(hits);
          const hitsWithoutAlreadyEnrolledCourses = hitsCamelCased.filter(el => !enrolledCourseIds.find(
            ele => el.advertisedCourseRun.key === ele,
          ));

          setCourses(hitsWithoutAlreadyEnrolledCourses.length <= 3 ? hitsWithoutAlreadyEnrolledCourses
            : hitsWithoutAlreadyEnrolledCourses.slice(0, 3));
          setHitCount(nbHits);
          setIsLoading(false);
        } else {
          setHitCount(nbHits);
          setIsLoading(false);
        }
      }
      fetchCourses();
    },
    [enrolledCourseIds, filters, index, selectedJob, skills, skillsFacetFilter],
  );

  if (hitCount === 0) {
    return (
      <Alert
        className="mt-4 mb-5"
        variant="info"
        dismissible={false}
        icon={ZoomOut}
        show
      >
        { NO_COURSES_ALERT_MESSAGE }
      </Alert>
    );
  }

  return (
    <div>
      <h3 className="mb-3">Get started with these courses</h3>
      <CardGrid>
        {courses.map(course => (
          <CourseCard
            key={uuidv4()}
            isLoading={isLoading}
            course={course}
            allSkills={selectedJobSkills}
          />
        ))}
      </CardGrid>
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
