import React, {
  useContext, useMemo, useState, useEffect,
} from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import { AppContext } from '@edx/frontend-platform/react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { CardGrid, Hyperlink } from '@openedx/paragon';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import SearchCourseCard from '../search/SearchCourseCard';

import { useDefaultSearchFilters, useSearchCatalogs } from '../search/data/hooks';
import { UserSubsidyContext } from '../enterprise-user-subsidy';
import { SubsidyRequestsContext } from '../enterprise-subsidy-requests';

const SkillsRecommendationCourses = ({ index, subCategoryName, subCategorySkills }) => {
  const { enterpriseConfig } = useContext(AppContext);
  const {
    subscriptionPlan,
    subscriptionLicense,
    couponCodes: { couponCodes },
    enterpriseOffers,
    redeemableLearnerCreditPolicies,
  } = useContext(UserSubsidyContext);
  const { catalogsForSubsidyRequests } = useContext(SubsidyRequestsContext);
  const navigate = useNavigate();

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
          filters: `content_type:course AND ${filters}`, // eslint-disable-line object-shorthand
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
    [filters, index, skillsFacetFilter],
  );
  if (hitCount === 0) {
    return null;
  }
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
      <CardGrid>
        {courses.map(course => (
          <SearchCourseCard
            key={`career-tab-${uuidv4()}`}
            isLoading={isLoading}
            hit={course}
          />
        ))}
      </CardGrid>
      <Hyperlink
        className="mt-3"
        onClick={() => {
          if (subCategorySkills.length > 0) {
            navigate(
              `/${enterpriseConfig.slug}/search`,
              {
                search: `showAll=1&content_type=course&skill_names=${subCategorySkills.join('&skill_names=')}`,
              },
            );
          }
        }}
      >
        <FormattedMessage
          id="enterprise.dashboard.my.career.tab.visualize.career.data.skill.category.show.more.courses"
          defaultMessage="Show more courses"
          description="Label for button to show more recommended courses in a category"
        />
      </Hyperlink>
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
