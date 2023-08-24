import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppContext } from '@edx/frontend-platform/react';
import '@testing-library/jest-dom/extend-expect';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import SearchProgramCard from '../SearchProgramCard';

import { renderWithRouter } from '../../../utils/tests';
import { TEST_ENTERPRISE_SLUG } from './constants';

const userId = 'batman';
const enterpriseUuid = '11111111-1111-1111-1111-111111111111';

jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedUser: () => ({ username: 'b.wayne', userId }),
}));

jest.mock('@edx/frontend-enterprise-utils', () => ({
  sendEnterpriseTrackEvent: jest.fn(),
}));

const SearchProgramCardWithAppContext = (props) => (
  <AppContext.Provider
    value={{
      enterpriseConfig: { slug: TEST_ENTERPRISE_SLUG, uuid: enterpriseUuid },
    }}
  >
    <SearchProgramCard {...props} />
  </AppContext.Provider>
);

const PROGRAM_UUID = 'a9cbdeb6-5fc0-44ef-97f7-9ed605a149db';
const PROGRAM_TITLE = 'Intro to BatVerse';
const PROGRAM_TYPE_DISPLAYED = 'MicroMasters® Program';
const PROGRAM_CARD_IMG_URL = 'http://card.image';
const PROGRAM_PARTNER_LOGO_IMG_URL = 'http://logo.image';
const PROGRAM_COURSES_COUNT_TEXT = '2 Courses';
const PROGRAM_AUTHOR_ORG = {
  key: 'BatmanX',
  name: 'Batman',
  logo_image_url: PROGRAM_PARTNER_LOGO_IMG_URL,
};

const defaultProps = {
  hit: {
    aggregation_key: `program:${PROGRAM_UUID}`,
    authoring_organizations: [
      PROGRAM_AUTHOR_ORG,
    ],
    card_image_url: PROGRAM_CARD_IMG_URL,
    course_keys: [
      'BatX+BAT100x',
      'BatX+BAT101x',
    ],
    title: PROGRAM_TITLE,
    type: 'MicroMasters',
  },
};

const propsForLoading = {
  hit: undefined,
  isLoading: true,
};

const programTypes = {
  MicroBachelors: 'MicroBachelors® Program',
  MicroMasters: 'MicroMasters® Program',
  XSeries: 'XSeries Program',
  Masters: 'Master\'s Degree Program',
  'Professional Certificate': 'Professional Certificate',
};

describe('<SearchProgramCard />', () => {
  test('renders the correct data', () => {
    const { container } = renderWithRouter(<SearchProgramCardWithAppContext {...defaultProps} />);

    expect(screen.getByText(PROGRAM_TITLE)).toBeInTheDocument();
    expect(screen.getByText(PROGRAM_AUTHOR_ORG.key)).toBeInTheDocument();

    // should show both logo image and card image with proper URLs
    const foundImages = container.querySelectorAll('img');
    expect(foundImages).toHaveLength(2);
    expect(foundImages[0]).toHaveAttribute('src', PROGRAM_CARD_IMG_URL);
    expect(foundImages[1]).toHaveAttribute('src', PROGRAM_PARTNER_LOGO_IMG_URL);

    expect(screen.getByTestId('program-type-badge')).toHaveTextContent(PROGRAM_TYPE_DISPLAYED);
    expect(screen.getByText(PROGRAM_COURSES_COUNT_TEXT)).toBeInTheDocument();
  });

  test('handles card click', () => {
    const { history } = renderWithRouter(<SearchProgramCardWithAppContext {...defaultProps} />);
    const cardEl = screen.getByTestId('search-program-card');
    userEvent.click(cardEl);
    expect(history.entries).toHaveLength(2);
    expect(history.location.pathname).toEqual(`/${TEST_ENTERPRISE_SLUG}/program/${PROGRAM_UUID}`);
  });

  test.each(Object.keys(programTypes))('renders the correct program type: %s', (type) => {
    const value = programTypes[type];
    const props = { ...defaultProps, ...{ hit: { ...defaultProps.hit, type } } };
    renderWithRouter(<SearchProgramCardWithAppContext {...props} />);
    expect(screen.getByTestId('program-type-badge')).toHaveTextContent(value);
  });

  test('does not render course count if no courses', () => {
    const props = { ...defaultProps, ...{ hit: { ...defaultProps.hit, course_keys: [] } } };
    const { container } = renderWithRouter(<SearchProgramCardWithAppContext {...props} />);
    expect(container.querySelector('span.program-courses-count-text')).toBe(null);
  });

  test('renders the loading state', () => {
    const { container } = renderWithRouter(<SearchProgramCardWithAppContext {...propsForLoading} />);

    // ensure `Card` was passed `isLoading` by asserting each `Card` subcomponent
    // is treated as a skeleton instead, indicated by `aria-busy="live"`.
    expect(container.querySelectorAll('[aria-busy="true"]')).toHaveLength(4);
  });

  test('sends correct event data upon click on view the course link', () => {
    renderWithRouter(<SearchProgramCardWithAppContext {...defaultProps} />);
    const cardEl = screen.getByTestId('search-program-card');
    userEvent.click(cardEl);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      enterpriseUuid,
      'edx.ui.enterprise.learner_portal.search.program.card.clicked',
      { programUuid: PROGRAM_UUID, userId },
    );
  });
});
