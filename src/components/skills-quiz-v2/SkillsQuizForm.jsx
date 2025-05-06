import { Button } from '@openedx/paragon';
import { useState } from 'react';
import { getConfig } from '@edx/frontend-platform/config';
import { InstantSearch } from 'react-instantsearch-dom';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import SearchJobDropdown from '../skills-quiz/SearchJobDropdown';
import CurrentJobDropdown from '../skills-quiz/CurrentJobDropdown';
import IndustryDropdown from '../skills-quiz/IndustryDropdown';
import GoalDropdown from '../skills-quiz/GoalDropdown';
import SearchJobCard from '../skills-quiz/SearchJobCard';
import { useAlgoliaSearch } from '../app/data';

const SkillQuizForm = ({ isStyleAutoSuggest }) => {
  const [hide, setHide] = useState(true);
  const config = getConfig();
  const {
    searchIndex: jobIndex,
    searchClient: jobSearchClient,
  } = useAlgoliaSearch(config.ALGOLIA_INDEX_NAME_JOBS);
  return (
    <div className="form">
      <InstantSearch
        indexName={jobIndex.indexName}
        searchClient={jobSearchClient}
      >
        <p className="mt-4 font-weight-bold">
          <FormattedMessage
            id="enterprise.skills.quiz.v2.roles.dropdown.label"
            defaultMessage="What roles are you interested in ?"
            description="Label prompting the user to select a role based on their inetrest on the skills quiz v2 page."
          />
        </p>
        <SearchJobDropdown key="search" isStyleSearchBox isChip />
        <Button
          variant="link"
          className="mb-2 mb-sm-0 text-decoration-none my-2 mx-n3"
          onClick={() => setHide(prevState => !prevState)}
        >
          {!hide ? (
            <FormattedMessage
              id="enterprise.skills.quiz.v2.hide.advanced.options.label"
              defaultMessage="Hide advanced options"
              description="Button text to hide advanced options on the skills quiz v2 page."
            />
          ) : (
            <FormattedMessage
              id="enterprise.skills.quiz.v2.show.advanced.options.label"
              defaultMessage="Show advanced options"
              description="Button text to show advanced options on the skills quiz v2 page."
            />
          )}
        </Button>
        {!hide && (
          <div>
            <p className="mt-4 font-weight-bold">
              <FormattedMessage
                id="enterprise.skills.quiz.v2.goals.dropdown.label"
                defaultMessage="Tell us about what you want to achieve ?"
                description="Label prompting the user to select a goal they want to achieve on the skills quiz v2 page."
              />
            </p>
            <GoalDropdown key="goal" />
            <p className="mt-4 font-weight-bold">
              <FormattedMessage
                id="enterprise.skills.quiz.v2.current.job.title"
                defaultMessage="Search and select your current job title"
                description="Label prompting the user to search and select their current job title on the skills quiz v2 page."
              />
            </p>
            <CurrentJobDropdown
              key="current"
              isStyleAutoSuggest={isStyleAutoSuggest}
            />

            <p className="mt-4 font-weight-bold">
              <FormattedMessage
                id="enterprise.skills.quiz.v2.industry.selection.label"
                defaultMessage="What industry are you interested in ?"
                description="Industry selection label prompting the user to select their relevant industry on the skills quiz v2 page."
              />
            </p>
            <IndustryDropdown key="industry" isStyleSearchBox />
          </div>
        )}
        <SearchJobCard isSkillQuizV2 />
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
