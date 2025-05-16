import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { CardGrid } from '@openedx/paragon';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import SearchCourseCard from '../search/SearchCourseCard';

import { useContentTypeFilter, useDefaultSearchFilters, useEnterpriseCustomer } from '../app/data';

const SkillsRecommendationCourses = ({ index, subCategoryName, subCategorySkills }) => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();

  const filters = useDefaultSearchFilters();
  const {
    courseFilter,
  } = useContentTypeFilter({ filter: filters });

  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [hitCount, setHitCount] = useState(undefined);

  const skillsFacetFilter = useMemo(
    () => {
      if (subCategorySkills.length > 0) {
        return subCategorySkills.map((skill) => `skill_names:${skill}`);
      }
      return [];
    },
    [subCategorySkills],
  );

  useEffect(
    () => {
      async function fetchCourses() {
        setIsLoading(true);
        const { hits, nbHits } = await index.search('', {
          filters: courseFilter,
          facetFilters: [
            skillsFacetFilter,
          ],
        });
        if (nbHits > 0) {
          const recommendedCourses = camelCaseObject(hits);

          setCourses(recommendedCourses.length <= 3 ? recommendedCourses
            : recommendedCourses.slice(0, 3));
          setHitCount(nbHits);
          setIsLoading(false);
        } else {
          setHitCount(nbHits);
          setIsLoading(false);
        }
      }
      fetchCourses();
    },
    [courseFilter, index, skillsFacetFilter],
  );
  if (hitCount === 0) {
    return null;
  }
  const showMoreLinkPath = `/${enterpriseCustomer.slug}/search?showAll=1&content_type=course&skill_names=${subCategorySkills.join('&skill_names=')}`;
  return (
    <div>
      <h5 className="mb-3 mt-n4">
        <FormattedMessage
          id="enterprise.dashboard.my.career.tab.visualize.career.data.skill.category.recommended.courses.title"
          defaultMessage="More courses that teach you {subCategoryName} Skills"
          description="Title for recommended courses in a category"
          values={{
            subCategoryName,
          }}
        />
      </h5>
      <CardGrid
        columnSizes={{
          xs: 12,
          sm: 6,
        }}
      >
        {courses.map(course => (
          <SearchCourseCard
            key={`career-tab-${uuidv4()}`}
            isLoading={isLoading}
            hit={course}
          />
        ))}
      </CardGrid>
      {subCategorySkills.length > 0 && (
        <Link
          className="mt-3"
          to={showMoreLinkPath}
        >
          <FormattedMessage
            id="enterprise.dashboard.my.career.tab.visualize.career.data.skill.category.show.more.courses"
            defaultMessage="Show more courses"
            description="Label for button to show more recommended courses in a category"
          />
        </Link>
      )}
    </div>
  );
};

SkillsRecommendationCourses.propTypes = {
  index: PropTypes.shape({
    appId: PropTypes.string,
    indexName: PropTypes.string,
    search: PropTypes.func.isRequired,
  }).isRequired,
  subCategoryName: PropTypes.string.isRequired,
  subCategorySkills: PropTypes.arrayOf(PropTypes.string),
};

SkillsRecommendationCourses.defaultProps = {
  subCategorySkills: [],
};

export default SkillsRecommendationCourses;
