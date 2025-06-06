import PropTypes from 'prop-types';
import { Configure, Index } from 'react-instantsearch-dom';
import { getConfig } from '@edx/frontend-platform/config';
import { useIntl } from '@edx/frontend-platform/i18n';

import { NUM_RESULTS_PATHWAY, PATHWAY_TITLE } from './constants';
import { SEARCH_INDEX_IDS } from '../../constants';
import SearchResults from './SearchResults';
import SearchPathwayCard from '../pathway/SearchPathwayCard';

/**
 * Renders the pathway-specific Algolia search results section.
 *
 * @component
 * @param {{ filter: string }} props
 * @param {string} props.filter - A fully formed Algolia filter string that already includes
 * the `content_type:pathway` clause. This ensures only pathway records are shown in results.
 *
 * @example
 * <SearchPathway filter="content_type:pathway AND topic:ai" />
 */
const SearchPathway = ({ filter }) => {
  const config = getConfig();
  const intl = useIntl();
  return (
    <Index indexName={config.ALGOLIA_INDEX_NAME} indexId={SEARCH_INDEX_IDS.PATHWAYS}>
      <Configure
        hitsPerPage={NUM_RESULTS_PATHWAY}
        filters={filter}
        clickAnalytics
      />
      <SearchResults
        hitComponent={SearchPathwayCard}
        title={PATHWAY_TITLE}
        translatedTitle={
          intl.formatMessage({
            id: 'enterprise.search.page.pathway.section.translated.title',
            defaultMessage: 'Pathways',
            description: 'Translated title for the enterprise search page pathway section.',
          })
        }
        isPathwaySearchResults
        componentId={SEARCH_INDEX_IDS.PATHWAYS}
      />
    </Index>
  );
};

SearchPathway.propTypes = {
  filter: PropTypes.string.isRequired,
};

export default SearchPathway;
