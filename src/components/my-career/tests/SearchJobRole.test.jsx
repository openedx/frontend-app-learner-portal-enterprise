import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { SearchContext, deleteRefinementAction } from '@edx/frontend-enterprise-catalog-search';
import { AppContext } from '@edx/frontend-platform/react';

import { fetchJobDetailsFromAlgolia, patchProfile } from '../data/service';
import { renderWithRouter } from '../../../utils/tests';
import SearchJobRole from '../SearchJobRole';
import { useAlgoliaSearch } from '../../app/data';

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useAlgoliaSearch: jest.fn(),
}));
// mocks
jest.mock('@edx/frontend-enterprise-catalog-search', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-catalog-search'),
  deleteRefinementAction: jest.fn(),
}));

jest.mock('../data/service', () => ({
  fetchJobDetailsFromAlgolia: jest.fn(),
  patchProfile: jest.fn(),
}));

// return values
fetchJobDetailsFromAlgolia.mockReturnValue({ id: 27 });
patchProfile.mockReturnValue({
  extended_profile: [{ enterprise_learner_current_job: 27 }],
});

// eslint-disable-next-line no-console
console.error = jest.fn();

const SearchJobRoleWithContext = ({ initialProps, defaultSearchContext }) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={{ authenticatedUser: { username: 'edx' } }}>
      <SearchContext.Provider value={defaultSearchContext}>
        <SearchJobRole {...initialProps} />
      </SearchContext.Provider>
    </AppContext.Provider>
  </IntlProvider>
);

describe('<SearchJobRole />', () => {
  const initialProps = {
    onSave: jest.fn(),
    onCancel: jest.fn(),
  };

  const defaultSearchContext = {
    refinements: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAlgoliaSearch.mockReturnValue({
      searchClient: {
        search: jest.fn(), appId: 'test-app-id',
      },
      searchIndex: {
        indexName: 'mock-index-name',
      },
    });
  });

  it('renders the SearchJobRole component', () => {
    renderWithRouter(
      <SearchJobRoleWithContext
        initialProps={initialProps}
        defaultSearchContext={defaultSearchContext}
      />,
    );
    expect(screen.getByTestId('save-button')).toBeInTheDocument();
    expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown')).toBeInTheDocument();
  });

  it('Save button component state is initially set to default and disabled', () => {
    renderWithRouter(
      <SearchJobRoleWithContext
        initialProps={initialProps}
        defaultSearchContext={defaultSearchContext}
      />,
    );
    const saveBtn = screen.getByRole('button', { name: 'Save' });
    expect(saveBtn).toHaveAttribute('aria-disabled', 'true');
    expect(saveBtn).toHaveClass('disabled');
  });

  it('Save button state is not disabled when a selection is made from dropdown', () => {
    const defaultSearchContextWithJob = {
      refinements: { current_job: 'Software Engineer' },
    };
    renderWithRouter(
      <SearchJobRoleWithContext
        initialProps={initialProps}
        defaultSearchContext={defaultSearchContextWithJob}
      />,
    );
    const saveBtn = screen.getByRole('button', { name: 'Save' });
    expect(saveBtn).not.toHaveAttribute('aria-disabled', 'true');
    expect(saveBtn).not.toHaveClass('disabled');
  });

  it('calls the appropriate methods to save job when Save button is clicked', async () => {
    const user = userEvent.setup();
    const defaultSearchContextWithJob = {
      refinements: { current_job: 'Software Engineer' },
      dispatch: () => jest.fn(),
    };
    renderWithRouter(
      <SearchJobRoleWithContext
        initialProps={initialProps}
        defaultSearchContext={defaultSearchContextWithJob}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await expect(fetchJobDetailsFromAlgolia).toHaveBeenCalled();
    await expect(patchProfile).toHaveBeenCalled();
  });

  it('calls the appropriate methods to remove selection when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const defaultSearchContextWithJob = {
      refinements: { current_job: 'Software Engineer' },
      dispatch: () => jest.fn(),
    };
    renderWithRouter(
      <SearchJobRoleWithContext
        initialProps={initialProps}
        defaultSearchContext={defaultSearchContextWithJob}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await expect(deleteRefinementAction).toHaveBeenCalled();
  });
});
