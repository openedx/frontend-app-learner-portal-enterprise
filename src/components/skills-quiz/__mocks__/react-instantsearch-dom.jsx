/* eslint-disable object-curly-newline */
/* eslint-disable react/prop-types */
import React from 'react';

const MockReactInstantSearch = jest.genMockFromModule(
  'react-instantsearch-dom',
);

const fakeHits = [
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
];

MockReactInstantSearch.connectStateResults = Component => (props) => (
  <Component
    searchResults={{
      hits: fakeHits,
      hitsPerPage: 25,
      nbHits: 2,
      nbPages: 1,
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
    nbPages={1}
    currentRefinement={1}
    maxPagesDisplayed={5}
    {...props}
  />
);

MockReactInstantSearch.InstantSearch = ({ children }) => <div>{children}</div>;

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

MockReactInstantSearch.InstantSearch = ({ children }) => <>{children}</>;
MockReactInstantSearch.Configure = () => <div>CONFIGURED</div>;
MockReactInstantSearch.Index = ({ children }) => <>{children}</>;

// It is necessary to export this way, or tests not using the mock will fail
module.exports = MockReactInstantSearch;
