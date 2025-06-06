import PropTypes from 'prop-types';
import { Configure, Index } from 'react-instantsearch-dom';
import { getConfig } from '@edx/frontend-platform/config';
import { useIntl } from '@edx/frontend-platform/i18n';

import { NUM_RESULTS_PROGRAM, PROGRAM_TITLE } from './constants';
import { SEARCH_INDEX_IDS } from '../../constants';
import SearchResults from './SearchResults';
import SearchProgramCard from './SearchProgramCard';

/**
 * Renders the program-specific Algolia search results.
 *
 * @param {{ filter: string }} props
 * @param {string} props.filter - A preconstructed Algolia filter string that includes the
 * `content_type:program` clause. This filter ensures only program results are returned.
 *
 * @example
 * <SearchProgram filter="content_type:program AND level:advanced" />
 */
const SearchProgram = ({ filter }) => {
  const config = getConfig();
  const intl = useIntl();
  return (
    <Index indexName={config.ALGOLIA_INDEX_NAME} indexId={SEARCH_INDEX_IDS.PROGRAMS}>
      <Configure
        hitsPerPage={NUM_RESULTS_PROGRAM}
        filters={filter}
        clickAnalytics
      />
      <SearchResults
        hitComponent={SearchProgramCard}
        title={PROGRAM_TITLE}
        translatedTitle={
          intl.formatMessage({
            id: 'enterprise.search.page.program.section.translated.title',
            defaultMessage: 'Programs',
            description: 'Translated title for the enterprise search page program section.',
          })
        }
        componentId={SEARCH_INDEX_IDS.PROGRAMS}
      />
    </Index>
  );
};

SearchProgram.propTypes = {
  filter: PropTypes.string.isRequired,
};

export default SearchProgram;
