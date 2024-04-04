import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppContext } from '@edx/frontend-platform/react';
import '@testing-library/jest-dom/extend-expect';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import SearchPathwayCard from '../SearchPathwayCard';
import { TEST_ENTERPRISE_SLUG, TEST_ENTERPRISE_UUID } from './constants';
import { PATHWAY_SEARCH_EVENT_NAME, PATHWAY_SKILL_QUIZ_EVENT_NAME } from '../constants';
import { renderWithRouter } from '../../../utils/tests';
import { useEnterpriseCustomer } from '../../app/data';

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
}));

jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

const initialAppState = {
  authenticatedUser: { userId: 'test-user-id', username: 'test-username' },
};

const SearchPathwayCardWithAppContext = (props) => (
  <AppContext.Provider value={initialAppState}>
    <SearchPathwayCard {...props} />
  </AppContext.Provider>
);

const TEST_PATHWAY_UUID = 'test-pathway-uuid';
const TEST_TITLE = 'Test Title';
const TEST_CARD_IMAGE_URL = 'https://fake.image';

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

const mockEnterpriseCustomer = {
  name: 'test-enterprise',
  slug: TEST_ENTERPRISE_SLUG,
  uuid: TEST_ENTERPRISE_UUID,
};

describe('<SearchPathwayCard />', () => {
  beforeEach(() => {
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });

    // Reset history state before each test
    window.history.pushState({}, '', '/');
  });

  test('renders the correct data', () => {
    const { container } = renderWithRouter(<SearchPathwayCardWithAppContext {...defaultProps} />);

    expect(screen.getByText(TEST_TITLE)).toBeInTheDocument();

    // should show card image with proper URL
    const cardImage = container.querySelectorAll('img');
    expect(cardImage).toHaveLength(1);
    cardImage.forEach((cardImg) => {
      expect(cardImg).toHaveAttribute('src', TEST_CARD_IMAGE_URL);
    });

    const cardEl = screen.getByTestId('search-pathway-card');
    userEvent.click(cardEl);
    expect(window.location.pathname).toEqual(`/${TEST_ENTERPRISE_SLUG}/search/${TEST_PATHWAY_UUID}`);
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

    // should show card image with proper URL
    const cardImage = container.querySelectorAll('img');
    expect(cardImage).toHaveLength(1);
    cardImage.forEach((cardImg) => {
      expect(cardImg).toHaveAttribute('src', TEST_CARD_IMAGE_URL);
    });

    const cardEl = screen.getByTestId('search-pathway-card');
    userEvent.click(cardEl);
    expect(window.location.pathname).toEqual(`/${TEST_ENTERPRISE_SLUG}/search/${TEST_PATHWAY_UUID}`);
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
    renderWithRouter(<SearchPathwayCardWithAppContext {...defaultProps} />);
    expect(screen.getByText(TEST_TITLE)).toBeInTheDocument();
    expect(screen.getByText(firstSkillName)).toBeInTheDocument();
    expect(screen.getByText(secondSkillName)).toBeInTheDocument();
    expect(screen.getByText(thirdSkillName)).toBeInTheDocument();
    expect(screen.queryByText(fourthSkillName)).not.toBeInTheDocument();
  });

  test('renders the loading state', () => {
    const { container } = renderWithRouter(<SearchPathwayCardWithAppContext {...propsForLoading} />);

    // ensure `Card` was passed `isLoading` by asserting each `Card` subcomponent
    // is treated as a skeleton instead, indicated by `aria-busy="true"`.
    expect(container.querySelectorAll('[aria-busy="true"]')).toHaveLength(2);

    // does not do anything when clicked
    const cardEl = screen.getByTestId('search-pathway-card');
    userEvent.click(cardEl);
    expect(window.location.pathname).toEqual('/');
  });
});
