import { Button } from '@edx/paragon';
import { useState, useMemo } from 'react';
import { getConfig } from '@edx/frontend-platform/config';
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch } from 'react-instantsearch-dom';
import PropTypes from 'prop-types';
import SearchJobDropdown from '../skills-quiz/SearchJobDropdown';
import CurrentJobDropdown from '../skills-quiz/CurrentJobDropdown';
import IndustryDropdown from '../skills-quiz/IndustryDropdown';
import GoalDropdown from '../skills-quiz/GoalDropdown';
import SearchJobCard from '../skills-quiz/SearchJobCard';

const SkillQuizForm = ({ isStyleAutoSuggest }) => {
  const config = getConfig();

  const [searchClient, courseIndex, jobIndex] = useMemo(() => {
    const client = algoliasearch(
      config.ALGOLIA_APP_ID,
      config.ALGOLIA_SEARCH_API_KEY,
    );
    const cIndex = client.initIndex(config.ALGOLIA_INDEX_NAME);
    const jIndex = client.initIndex(config.ALGOLIA_INDEX_NAME_JOBS);
    return [client, cIndex, jIndex];
  }, [
    config.ALGOLIA_APP_ID,
    config.ALGOLIA_INDEX_NAME,
    config.ALGOLIA_INDEX_NAME_JOBS,
    config.ALGOLIA_SEARCH_API_KEY,
  ]);
  const [hide, setHide] = useState(true);

  return (
    <div className="form">
      <InstantSearch
        indexName={config.ALGOLIA_INDEX_NAME_JOBS}
        searchClient={searchClient}
      >
        <p className="mt-4 font-weight-bold">
          What roles are you interested in ?
        </p>
        <SearchJobDropdown key="search" isStyleSearchBox isChip />
        <Button
          variant="link"
          className="mb-2 mb-sm-0 text-decoration-none my-2 mx-n3"
          onClick={() => setHide(!hide)}
        >
          {!hide ? 'Hide advanced options' : 'Show advanced options'}
        </Button>
        {!hide && (
          <div>
            <p className="mt-4 font-weight-bold">
              Tell us about what you want to achieve ?
            </p>
            <GoalDropdown key="goal" />
            <p className="mt-4 font-weight-bold">
              Search and select your current job title
            </p>
            <CurrentJobDropdown
              key="current"
              isStyleAutoSuggest={isStyleAutoSuggest}
            />

            <p className="mt-4 font-weight-bold">
              What industry are you interested in ?
            </p>
            <IndustryDropdown key="industry" isStyleSearchBox />
          </div>
        )}
        <SearchJobCard index={jobIndex} courseIndex={courseIndex} isSkillQuizV2 />
      </InstantSearch>
    </div>
  );
};

SkillQuizForm.propTypes = {
  isStyleAutoSuggest: PropTypes.bool,
};

SkillQuizForm.defaultProps = {
  isStyleAutoSuggest: false,
};

export default SkillQuizForm;
