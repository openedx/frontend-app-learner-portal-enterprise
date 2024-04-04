import React, {
  useContext, useMemo, useState, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { CardGrid } from '@openedx/paragon';

import { SkillsContext } from './SkillsContextProvider';
import { useSelectedSkillsAndJobSkills } from './data/hooks';
import SearchPathwayCard from '../pathway/SearchPathwayCard';
import { useDefaultSearchFilters } from '../app/data';

const SearchPathways = ({ index }) => {
  const filters = useDefaultSearchFilters();

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
    [selectedJobSkills],
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
    [filters, index, selectedJob, skills, skillsFacetFilter],
  );

  if (hitCount === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="mb-3">
        <FormattedMessage
          id="enterprise.skills.quiz.v1.pathways.card.heading"
          defaultMessage="Get started with these pathways"
          description="Heading for pathways displayed for users to get started with on skills quiz v1 page"
        />
      </h3>
      <CardGrid>
        {pathways.map(pathway => (
          <SearchPathwayCard key={pathway.uuid} isLoading={isLoading} hit={pathway} isSkillQuizResult />
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
