import React, {
  useContext, useMemo, useState, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { CardGrid } from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import { SkillsContext } from './SkillsContextProvider';
import { useSelectedSkillsAndJobSkills } from './data/hooks';
import { useDefaultSearchFilters } from '../search/data/hooks';
import { UserSubsidyContext } from '../enterprise-user-subsidy';
import SearchPathwayCard from '../pathway/SearchPathwayCard';

const SearchPathways = ({ index }) => {
  const { enterpriseConfig } = useContext(AppContext);
  const { subscriptionPlan, subscriptionLicense, offers: { offers } } = useContext(UserSubsidyContext);
  const offerCatalogs = offers.map((offer) => offer.catalog);
  const { filters } = useDefaultSearchFilters({
    enterpriseConfig,
    subscriptionPlan,
    subscriptionLicense,
    offerCatalogs,
  });

  const { state } = useContext(SkillsContext);
  const [isLoading, setIsLoading] = useState(true);
  const [pathways, setPathways] = useState([]);
  const [hitCount, setHitCount] = useState(undefined);
  const { refinements } = useContext(SearchContext);
  const { skill_names: skills } = refinements;
  const { selectedJob } = state;
  // Top 3 Recommended pathways are determined based on job-skills only, coming either from Search Job or Current Job
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
      async function fetchPathways() {
        setIsLoading(true);
        const { hits, nbHits } = await index.search('', {
          filters: `content_type:learnerpathway AND ${filters}`, // eslint-disable-line object-shorthand
          facetFilters: [
            skillsFacetFilter,
          ],
        });
        if (nbHits > 0) {
          setPathways(hits.length <= 3 ? camelCaseObject(hits) : camelCaseObject(hits.slice(0, 3)));
          setHitCount(nbHits);
          setIsLoading(false);
        } else {
          setHitCount(nbHits);
          setIsLoading(false);
        }
      }
      fetchPathways();
    },
    [selectedJob, skills],
  );

  return (
    <div>
      {(hitCount > 0) ? <h3 className="mt-2 mb-2"> Get started with these pathways </h3> : null}
      <CardGrid className="skill-quiz-results">
        {(hitCount > 0) && pathways.map(pathway => (
          <SearchPathwayCard isLoading={isLoading} hit={pathway} isSkillQuizResult />
        ))}
      </CardGrid>
    </div>
  );
};

SearchPathways.propTypes = {
  index: PropTypes.shape({
    appId: PropTypes.string,
    indexName: PropTypes.string,
    search: PropTypes.func.isRequired,
  }).isRequired,
};

export default SearchPathways;
