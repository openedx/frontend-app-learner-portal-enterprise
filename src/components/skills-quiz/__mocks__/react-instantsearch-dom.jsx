/* eslint-disable object-curly-newline */
/* eslint-disable react/prop-types */
const React = require('react');

const MockReactInstantSearch = jest.genMockFromModule(
  'react-instantsearch-dom',
);

const originalState = {
  hits: [
    {
      objectID: '1',
      title: 'bla',
      key: 'Bees101',
      type: 'course',
      aggregation_key: 'course:Bees101',
      authoring_organizations: [],
      card_image_url: 'https://fake.image',
      course_keys: [],
    },
    {
      objectID: '2',
      title: 'blp',
      key: 'Wasps200',
      type: 'course',
      aggregation_key: 'course:Wasps200',
      authoring_organizations: [],
      card_image_url: 'https://fake.image',
      course_keys: [],
    },
  ],
  nbHits: 2,
};

const mockState = {
  hits: originalState.hits,
  nbHits: originalState.nbHits,
};

// This allows you to override the built-in hits object
const setFakeHits = hits => {
  mockState.hits = hits;
  mockState.nbHits = hits.length;
};

const resetMockReactInstantSearch = () => {
  mockState.hits = originalState.hits;
  mockState.nbHits = originalState.nbHits;
};

MockReactInstantSearch.connectStateResults = Component => (props) => (
  <Component
    searchResults={{
      hits: mockState.hits,
      hitsPerPage: 25,
      nbHits: mockState.nbHits,
      nbPages: mockState.nbHits === 0 ? 0 : 1,
      page: 1,
    }}
    isSearchStalled={false}
    searchState={{
      page: 1,
    }}
    {...props}
  />
);

MockReactInstantSearch.connectPagination = Component => (props) => (
  <Component
    nbPages={mockState.nbHits === 0 ? 0 : 1}
    currentRefinement={1}
    maxPagesDisplayed={5}
    {...props}
  />
);

MockReactInstantSearch.connectRefinementList = Component => (props) => (
  <Component
    attribute="skills"
    currentRefinement={[]}
    items={[]}
    refinements={{}}
    title="Foo"
    searchForItems={() => {}}
    {...props}
  />
);

MockReactInstantSearch.InstantSearch = function InstantSearch({ children }) { return children; };
MockReactInstantSearch.Configure = function Configure() { return <div>CONFIGURED</div>; };
MockReactInstantSearch.Index = function Index({ children }) { return children; };

// It is necessary to export this way, or tests not using the mock will fail
module.exports = MockReactInstantSearch;
Object.assign(module.exports, {
  setFakeHits,
  resetMockReactInstantSearch,
});
