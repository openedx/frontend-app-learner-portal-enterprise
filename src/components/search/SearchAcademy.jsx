import { CardGrid, Container } from '@openedx/paragon';
import { v4 as uuidv4 } from 'uuid';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import SearchAcademyCard from '../academies/SearchAcademyCard';
import { ACADEMY_TITLE, CARDGRID_COLUMN_SIZES } from './constants';
import { useAcademies } from '../hooks';
import SearchError from './SearchError';

const SearchAcademy = () => {
  const { data: academies, isError: fetchError } = useAcademies();

  if (fetchError) {
    return (
      <Container size="lg" className="search-results py-5">
        <SearchError title={ACADEMY_TITLE} />
      </Container>
    );
  }

  if (academies.length === 0) {
    return null;
  }

  return (
    <Container size="lg" className="search-results py-5">
      <h2>
        <FormattedMessage
          id="enterprise.search.page.academies.section.title"
          defaultMessage="edX Academies; designed to meet your most critical business needs"
          description="Title of the academies section on the enterprise search page."
        />
      </h2>
      <p>
        <FormattedMessage
          id="enterprise.search.page.academies.section.subtile"
          defaultMessage="Choose from a curated range of programs aligned to the most in demand capability and skill areas crucial to organization success."
          description="Subtitle of the academies section on the enterprise search page."
        />
      </p>
      <div className="academies-grid">
        <CardGrid columnSizes={CARDGRID_COLUMN_SIZES}>
          {academies.map((academy) => <SearchAcademyCard key={uuidv4()} {...academy} />)}
        </CardGrid>
      </div>
    </Container>
  );
};

export default SearchAcademy;
