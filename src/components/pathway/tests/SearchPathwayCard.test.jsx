import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import '@testing-library/jest-dom/extend-expect';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import SearchPathwayCard from '../SearchPathwayCard';
import { TEST_ENTERPRISE_SLUG, TEST_ENTERPRISE_UUID } from './constants';
import { PATHWAY_SEARCH_EVENT_NAME, PATHWAY_SKILL_QUIZ_EVENT_NAME } from '../constants';
import { renderWithRouter } from '../../../utils/tests';

jest.mock('react-truncate', () => ({
  __esModule: true,
  default: ({ children }) => children,
}));

jest.mock('react-loading-skeleton', () => ({
  __esModule: true,
  // eslint-disable-next-line react/prop-types
  default: (props = {}) => <div data-testid={props['data-testid']} />,
}));

jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

function SearchPathwayCardWithAppContext(props) {
  return (
    <AppContext.Provider
      // eslint-disable-next-line react/jsx-no-constructed-context-values
      value={{
        enterpriseConfig: { slug: TEST_ENTERPRISE_SLUG, uuid: TEST_ENTERPRISE_UUID },
      }}
    >
      <SearchPathwayCard {...props} />
    </AppContext.Provider>
  );
}

const TEST_PATHWAY_UUID = 'test-pathway-uuid';
const TEST_TITLE = 'Test Title';
const TEST_CARD_IMAGE_URL = 'http://fake.image';

const defaultProps = {
  hit: {
    aggregation_key: `learner_pathway:${TEST_PATHWAY_UUID}`,
    title: TEST_TITLE,
    card_image_url: TEST_CARD_IMAGE_URL,
  },
};

const propsForLoading = {
  hit: {},
  isLoading: true,
};

describe('<SearchPathwayCard />', () => {
  test('renders the correct data', () => {
    const { container } = renderWithRouter(<SearchPathwayCardWithAppContext {...defaultProps} />);

    expect(screen.getByText(TEST_TITLE)).toBeInTheDocument();

    expect(container.querySelector('.search-pathway-card > a')).toHaveAttribute(
      'href',
      `/${TEST_ENTERPRISE_SLUG}/search/${TEST_PATHWAY_UUID}`,
    );
    expect(container.querySelector('.pgn__card-image-cap')).toHaveAttribute('src', TEST_CARD_IMAGE_URL);

    fireEvent.click(screen.getByText(TEST_TITLE));
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      TEST_ENTERPRISE_UUID,
      PATHWAY_SEARCH_EVENT_NAME,
      expect.objectContaining({
        pathwayUUID: TEST_PATHWAY_UUID,
      }),
    );
  });

  test('renders the correct data when clicked from skills quiz page', () => {
    const propsForSkillQuiz = { ...defaultProps, isSkillQuizResult: true };
    const { container } = renderWithRouter(<SearchPathwayCardWithAppContext {...propsForSkillQuiz} />);

    expect(screen.getByText(TEST_TITLE)).toBeInTheDocument();

    expect(container.querySelector('.search-pathway-card > a')).toHaveAttribute(
      'href',
      `/${TEST_ENTERPRISE_SLUG}/search/${TEST_PATHWAY_UUID}`,
    );
    expect(container.querySelector('.pgn__card-image-cap')).toHaveAttribute('src', TEST_CARD_IMAGE_URL);

    fireEvent.click(screen.getByText(TEST_TITLE));
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      TEST_ENTERPRISE_UUID,
      PATHWAY_SKILL_QUIZ_EVENT_NAME,
      expect.objectContaining({
        pathwayUUID: TEST_PATHWAY_UUID,
      }),
    );
  });

  test('renders the tags correctly', () => {
    const skillName45CharactersLong = 'Tag 45 characters long.Tag 45 characters long.Tag 45 characters long.Tag 45 characters.';
    const firstSkillName = 'Software Engineering';
    const secondSkillName = 'Database Design Principles';
    const thirdSkillName = 'Third final tag';
    const fourthSkillName = 'Fourth tag that should not be displayed.';
    defaultProps.hit.skillNames = [
      skillName45CharactersLong, firstSkillName, secondSkillName, thirdSkillName, fourthSkillName,
    ];
    const { container } = renderWithRouter(<SearchPathwayCardWithAppContext {...defaultProps} />);

    expect(screen.getByText(TEST_TITLE)).toBeInTheDocument();

    expect(container.querySelector('.search-pathway-card > a')).toHaveAttribute(
      'href',
      `/${TEST_ENTERPRISE_SLUG}/search/${TEST_PATHWAY_UUID}`,
    );
    expect(container.querySelector('.pathway-skill-names').textContent).toContain(firstSkillName);
    expect(container.querySelector('.pathway-skill-names').textContent).toContain(secondSkillName);
    expect(container.querySelector('.pathway-skill-names').textContent).toContain(thirdSkillName);
    expect(container.querySelector('.pathway-skill-names').textContent).not.toContain(fourthSkillName);
  });

  test('renders the loading state', () => {
    renderWithRouter(<SearchPathwayCardWithAppContext {...propsForLoading} />);

    // assert <Skeleton /> loading components render to verify
    // course card is properly in a loading state.
    expect(screen.queryByTestId('pathway-title-loading')).toBeInTheDocument();
    expect(screen.queryByTestId('content-type-loading')).toBeInTheDocument();
  });
});
