import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform/config';
import '@testing-library/jest-dom';

import SearchCourse from '../SearchCourse';
import { useEnterpriseFeatures } from '../../app/data';
import { isExperimentVariant } from '../../../utils/optimizely';

// Capture the indexName passed to the Algolia <Index>, keeping the rest of
// react-instantsearch-dom intact (connectSearchBox etc. are needed transitively at import).
jest.mock('react-instantsearch-dom', () => ({
  ...jest.requireActual('react-instantsearch-dom'),
  Index: function Index({ indexName, children }) {
    return <div data-testid="course-index" data-index-name={indexName}>{children}</div>;
  },
  Configure: function Configure() { return null; },
}));
jest.mock('../SearchResults', () => function SearchResults() {
  return <div data-testid="search-results" />;
});
jest.mock('../SearchCourseCard', () => function SearchCourseCard() { return null; });

jest.mock('@edx/frontend-platform/config', () => ({
  ...jest.requireActual('@edx/frontend-platform/config'),
  getConfig: jest.fn(() => ({})),
}));
jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseFeatures: jest.fn(),
}));
jest.mock('../../../utils/optimizely', () => ({
  ...jest.requireActual('../../../utils/optimizely'),
  isExperimentVariant: jest.fn(),
}));

const PRIMARY_INDEX = 'enterprise_catalog';
const RECENCY_REPLICA = 'enterprise_catalog_recently_published_desc';

const renderSearchCourse = () => render(
  <IntlProvider locale="en">
    <SearchCourse filter="content_type:course" />
  </IntlProvider>,
);

describe('<SearchCourse>', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getConfig.mockReturnValue({
      ALGOLIA_INDEX_NAME: PRIMARY_INDEX,
      ALGOLIA_RECENTLY_PUBLISHED_REPLICA_INDEX_NAME: RECENCY_REPLICA,
      EXPERIMENT_3_ID: 'exp-3-id',
      EXPERIMENT_3_VARIANT_2_ID: 'exp-3-newest-variant-id',
    });
  });

  it('uses the relevance (primary) index when the waffle flag is disabled', () => {
    useEnterpriseFeatures.mockReturnValue({ data: { searchDefaultSortNewestEnabled: false } });
    isExperimentVariant.mockReturnValue(true); // variant on, but flag off -> still primary
    renderSearchCourse();
    expect(screen.getByTestId('course-index')).toHaveAttribute('data-index-name', PRIMARY_INDEX);
  });

  it('uses the relevance (primary) index when flagged but not in the newest variant', () => {
    useEnterpriseFeatures.mockReturnValue({ data: { searchDefaultSortNewestEnabled: true } });
    isExperimentVariant.mockReturnValue(false);
    renderSearchCourse();
    expect(screen.getByTestId('course-index')).toHaveAttribute('data-index-name', PRIMARY_INDEX);
  });

  it('uses the recency replica when the flag is on AND in the newest variant', () => {
    useEnterpriseFeatures.mockReturnValue({ data: { searchDefaultSortNewestEnabled: true } });
    isExperimentVariant.mockReturnValue(true);
    renderSearchCourse();
    expect(screen.getByTestId('course-index')).toHaveAttribute('data-index-name', RECENCY_REPLICA);
    expect(isExperimentVariant).toHaveBeenCalledWith('exp-3-id', 'exp-3-newest-variant-id');
  });

  it('falls back to the primary index when no recency replica is configured', () => {
    getConfig.mockReturnValue({
      ALGOLIA_INDEX_NAME: PRIMARY_INDEX,
      ALGOLIA_RECENTLY_PUBLISHED_REPLICA_INDEX_NAME: null,
      EXPERIMENT_3_ID: 'exp-3-id',
      EXPERIMENT_3_VARIANT_2_ID: 'exp-3-newest-variant-id',
    });
    useEnterpriseFeatures.mockReturnValue({ data: { searchDefaultSortNewestEnabled: true } });
    isExperimentVariant.mockReturnValue(true);
    renderSearchCourse();
    expect(screen.getByTestId('course-index')).toHaveAttribute('data-index-name', PRIMARY_INDEX);
  });
});
