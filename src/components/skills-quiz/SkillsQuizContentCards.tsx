import { Stack } from '@openedx/paragon/dist';
import { InstantSearch } from 'react-instantsearch-dom';
import SearchCourseCard from './SearchCourseCard';
import SearchProgramCard from './SearchProgramCard';
import SearchPathways from './SearchPathways';
import { useAlgoliaSearch } from '../app/data';
import { SearchUnavailableAlert } from '../search-unavailable-alert';

const SkillsQuizContentCards = () => {
  const {
    searchClient,
    searchIndex: courseIndex,
  } = useAlgoliaSearch();
  if (!searchClient || !courseIndex) {
    return <SearchUnavailableAlert />;
  }
  // TODO: Refactor individual card components to move away from index.search to Configure
  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={courseIndex}
    >
      <Stack gap={4}>
        <SearchCourseCard index={courseIndex} />
        <SearchProgramCard index={courseIndex} />
        <SearchPathways index={courseIndex} />
      </Stack>
    </InstantSearch>
  );
};

export default SkillsQuizContentCards;
