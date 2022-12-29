/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable object-curly-newline */
/* eslint-disable react/prop-types */
// eslint-disable-next-line import/no-import-module-exports
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

MockReactInstantSearch.connectStateResults = Component => function (props) {
  return (
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
};

MockReactInstantSearch.connectPagination = Component => function (props) {
  return (
    <Component
      nbPages={1}
      currentRefinement={1}
      maxPagesDisplayed={5}
      {...props}
    />
  );
};

MockReactInstantSearch.InstantSearch = function ({ children }) {
  return <div>{children}</div>;
};

MockReactInstantSearch.connectRefinementList = Component => function (props) {
  return (
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
};

MockReactInstantSearch.InstantSearch = function ({ children }) {
  return <>{children}</>;
};
MockReactInstantSearch.Configure = function () {
  return <div>CONFIGURED</div>;
};
MockReactInstantSearch.Index = function ({ children }) {
  return <>{children}</>;
};

// It is necessary to export this way, or tests not using the mock will fail
module.exports = MockReactInstantSearch;
