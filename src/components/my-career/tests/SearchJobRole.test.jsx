import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { mount } from 'enzyme';
import ReactDOM from 'react-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { SearchContext, deleteRefinementAction } from '@edx/frontend-enterprise-catalog-search';
import FacetListRefinement from '@edx/frontend-enterprise-catalog-search/FacetListRefinement';
import { StatefulButton } from '@openedx/paragon';

import { AppContext } from '@edx/frontend-platform/react';
import { fetchJobDetailsFromAlgolia, patchProfile } from '../data/service';
import { renderWithRouter } from '../../../utils/tests';
import SearchJobRole from '../SearchJobRole';
import { useAlgoliaSearch } from '../../../utils/hooks';

// mocks
jest.mock('@edx/frontend-enterprise-catalog-search', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-catalog-search'),
  deleteRefinementAction: jest.fn(),
}));

jest.mock('../../../utils/hooks', () => ({
  useAlgoliaSearch: jest.fn(),
}));

jest.mock('../data/service', () => ({
  fetchJobDetailsFromAlgolia: jest.fn(),
  patchProfile: jest.fn(),
}));

// return values
fetchJobDetailsFromAlgolia.mockReturnValue({ id: 27 });
patchProfile.mockReturnValue(
  {
    extended_profile: [{ enterprise_learner_current_job: 27 }],
  },
);

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
    useAlgoliaSearch.mockReturnValue([jest.fn(), jest.fn()]);
  });

  it('renders the SearchJobRole component', () => {
    const { container } = renderWithRouter(
      <SearchJobRoleWithContext
        initialProps={initialProps}
        defaultSearchContext={defaultSearchContext}
      />,
    );
    expect(screen.getByTestId('save-button')).toBeInTheDocument();
    expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown')).toBeInTheDocument();
    ReactDOM.unmountComponentAtNode(container);
  });

  it('Save button component state is initially set to default and disabled', () => {
    const wrapper = mount((
      <IntlProvider locale="en">
        <AppContext.Provider value={{ authenticatedUser: { username: 'edx' } }}>
          <SearchContext.Provider value={defaultSearchContext}>
            <SearchJobRole {...initialProps} />
          </SearchContext.Provider>
        </AppContext.Provider>
      </IntlProvider>
    ));

    const defaultState = 'default';
    expect(wrapper.find(StatefulButton).prop('state')).toEqual(defaultState);
    expect(wrapper.find(StatefulButton).prop('disabledStates')).toContain(defaultState);
    wrapper.unmount();
  });

  it('Save button state is not disabled when a selection is made from dropdown', () => {
    const defaultSearchContextWithJob = {
      refinements: { current_job: 'Software Engineer' },
    };

    const wrapper = mount((
      <IntlProvider locale="en">
        <AppContext.Provider value={{ authenticatedUser: { username: 'edx' } }}>
          <SearchContext.Provider value={defaultSearchContextWithJob}>
            <SearchJobRole {...initialProps} />
          </SearchContext.Provider>
        </AppContext.Provider>
      </IntlProvider>
    ));

    const defaultState = 'default';
    expect(wrapper.find(StatefulButton).prop('state')).toEqual(defaultState);
    expect(wrapper.find(StatefulButton).prop('disabledStates')).not.toContain(defaultState);
    wrapper.unmount();
  });

  it('calls the appropriate methods to save job when Save button is clicked', async () => {
    const defaultSearchContextWithJob = {
      refinements: { current_job: 'Software Engineer' },
      dispatch: () => jest.fn(),
    };
    const wrapper = mount((
      <IntlProvider locale="en">
        <AppContext.Provider value={{ authenticatedUser: { username: 'edx' } }}>
          <SearchContext.Provider value={defaultSearchContextWithJob}>
            <SearchJobRole {...initialProps} />
          </SearchContext.Provider>
        </AppContext.Provider>
      </IntlProvider>
    ));
    wrapper.find(FacetListRefinement).simulate('change', { target: { value: 'Software Engineer' } });
    wrapper.find(StatefulButton).simulate('click');
    wrapper.update();
    await expect(fetchJobDetailsFromAlgolia).toHaveBeenCalled();
    await expect(patchProfile).toHaveBeenCalled();
    wrapper.unmount();
  });

  it('calls the appropriate methods to remove selection when Cancel button is clicked', async () => {
    const defaultSearchContextWithJob = {
      refinements: { current_job: 'Software Engineer' },
      dispatch: () => jest.fn(),
    };
    const wrapper = mount((
      <IntlProvider locale="en">
        <AppContext.Provider value={{ authenticatedUser: { username: 'edx' } }}>
          <SearchContext.Provider value={defaultSearchContextWithJob}>
            <SearchJobRole {...initialProps} />
          </SearchContext.Provider>
        </AppContext.Provider>
      </IntlProvider>
    ));
    wrapper.find('.cancel-btn').hostNodes().simulate('click');
    wrapper.update();
    await expect(deleteRefinementAction).toHaveBeenCalled();
    wrapper.unmount();
  });
});
