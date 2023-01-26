import React from 'react';
import { screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import '@testing-library/jest-dom/extend-expect';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import userEvent from '@testing-library/user-event';
import PathwayModal from '../PathwayModal';
import { useLearnerPathwayData } from '../data/hooks';
import { TEST_ENTERPRISE_SLUG, TEST_PATHWAY_DATA } from './constants';

import { renderWithRouter } from '../../../utils/tests';

jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedUser: () => ({ username: 'b.wayne' }),
  getAuthenticatedHttpClient: jest.fn(),
}));

jest.mock('../data/hooks', () => ({
  useLearnerPathwayData: jest.fn(),
}));

jest.mock('react-loading-skeleton', () => ({
  __esModule: true,
  default: (props = {}) => <div data-testid={props['data-testid']} />,
}));

const PathwayModalWithAppContext = (props) => (
  <AppContext.Provider
    value={{
      enterpriseConfig: { slug: TEST_ENTERPRISE_SLUG },
    }}
  >
    <PathwayModal {...props} />
  </AppContext.Provider>
);

const defaultProps = {
  learnerPathwayUuid: TEST_PATHWAY_DATA.uuid,
  isOpen: true,
  close: () => {},
};

const nodePageLink = (node) => {
  const slug = TEST_ENTERPRISE_SLUG;
  return node.content_type === 'course' ? `/${slug}/course/${node.key}` : `/${slug}/program/${node.uuid}`;
};

describe('<PathwayModal />', () => {
  test('renders the correct data', () => {
    useLearnerPathwayData.mockImplementation(() => ([camelCaseObject(TEST_PATHWAY_DATA), false, null]));

    renderWithRouter(<PathwayModalWithAppContext {...defaultProps} />);

    expect(screen.getByText(TEST_PATHWAY_DATA.title)).toBeInTheDocument();
    expect(screen.getByText(TEST_PATHWAY_DATA.overview)).toBeInTheDocument();
    expect(screen.getByTestId('modal-hero')).toHaveStyle(`background-image: url(${TEST_PATHWAY_DATA.banner_image})`);

    // verify static text
    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.getByText('Curated by learning professionals')).toBeInTheDocument();
    expect(screen.getByText('1 course and 1 program')).toBeInTheDocument();
    expect(screen.getByText('Across 2 requirements')).toBeInTheDocument();
    expect(screen.getByText('Included with catalog')).toBeInTheDocument();
    expect(screen.getByText('Learn at zero cost to you')).toBeInTheDocument();

    // verify Collapsibles
    for (let i = 0; i < TEST_PATHWAY_DATA.steps.length; i++) {
      const step = TEST_PATHWAY_DATA.steps[i];
      const collapsibleTitle = `Requirement ${i + 1}: Choose any ${step.min_requirement} of the following`;
      expect(screen.getByText(collapsibleTitle)).toBeInTheDocument();
      userEvent.click(screen.getByText(collapsibleTitle));

      const allNodes = [].concat(step.courses, step.programs);
      for (i = 0; i < allNodes.length; i++) {
        const node = allNodes[i];
        const buttonText = node.content_type === 'course' ? 'Course Details' : 'Program Details';
        const imgTestId = `card-image-${step.uuid}-${i}`;
        expect(screen.getByText(node.title)).toBeInTheDocument();
        expect(screen.getByText(node.short_description)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: buttonText })).toHaveAttribute('href', nodePageLink(node));
        expect(screen.getByTestId(imgTestId)).toHaveAttribute('src', node.card_image_url);
      }
    }
  });

  test('renders the loading state', () => {
    useLearnerPathwayData.mockImplementation(() => ([{}, true, null]));

    renderWithRouter(<PathwayModalWithAppContext {...defaultProps} />);

    // assert <Skeleton /> loading components render to verify
    // pathway model is properly in a loading state.
    expect(screen.queryByTestId('pathway-banner-loading')).toBeInTheDocument();
    expect(screen.queryByTestId('pathway-name-loading')).toBeInTheDocument();
    expect(screen.queryByTestId('pathway-badge-loading')).toBeInTheDocument();
    expect(screen.queryByTestId('pathway-nodes-count-loading')).toBeInTheDocument();
    expect(screen.queryByTestId('pathway-catalog-info-loading')).toBeInTheDocument();
    expect(screen.queryByTestId('pathway-overview-loading')).toBeInTheDocument();
    expect(screen.queryByTestId('pathway-collapsibles-loading')).toBeInTheDocument();
  });
});
