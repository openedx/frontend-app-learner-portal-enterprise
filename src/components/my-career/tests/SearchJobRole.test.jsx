import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { mount } from 'enzyme';
import ReactDOM from 'react-dom';
import { SearchContext, deleteRefinementAction } from '@edx/frontend-enterprise-catalog-search';
import FacetListRefinement from '@edx/frontend-enterprise-catalog-search/FacetListRefinement';
import { StatefulButton } from '@openedx/paragon';

import { fetchJobDetailsFromAlgolia, patchProfile } from '../data/service';
import { renderWithRouter } from '../../../utils/tests';
import SearchJobRole from '../SearchJobRole';

// mocks
jest.mock('@edx/frontend-enterprise-catalog-search', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-catalog-search'),
  deleteRefinementAction: jest.fn(),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedUser: () => ({ username: 'edx' }),
}));

jest.mock('../../utils/hooks', () => ({
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
  <SearchContext.Provider value={defaultSearchContext}>
    <SearchJobRole {...initialProps} />
  </SearchContext.Provider>
);

describe('<SearchJobRole />', () => {
  const initialProps = {
    onSave: jest.fn(),
    onCancel: jest.fn(),
  };

  const defaultSearchContext = {
    refinements: {},
  };

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
      <SearchContext.Provider value={defaultSearchContext}>
        <SearchJobRole {...initialProps} />
      </SearchContext.Provider>
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
      <SearchContext.Provider value={defaultSearchContextWithJob}>
        <SearchJobRole {...initialProps} />
      </SearchContext.Provider>
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
      <SearchContext.Provider value={defaultSearchContextWithJob}>
        <SearchJobRole {...initialProps} />
      </SearchContext.Provider>
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
      <SearchContext.Provider value={defaultSearchContextWithJob}>
        <SearchJobRole {...initialProps} />
      </SearchContext.Provider>
    ));
    wrapper.find('.cancel-btn').hostNodes().simulate('click');
    wrapper.update();
    await expect(deleteRefinementAction).toHaveBeenCalled();
    wrapper.unmount();
  });
});
