import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import {
  screen, render, fireEvent,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { camelCaseObject } from '@edx/frontend-platform/utils';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';

import PathwayProgressCard from '../PathwayProgressCard';
import LearnerPathwayProgressData from '../data/__mocks__/PathwayProgressListData.json';

const mockedPush = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockedPush,
  }),
  useLocation: jest.fn(),
}));

/* eslint-disable react/prop-types */
const PathwayProgressListingCardWithContext = ({ initialAppState, initialUserSubsidyState, pathwayData }) => (
  <AppContext.Provider value={initialAppState}>
    <UserSubsidyContext.Provider value={initialUserSubsidyState}>
      <PathwayProgressCard pathway={pathwayData} />
    </UserSubsidyContext.Provider>
  </AppContext.Provider>
);

const appState = {
  enterpriseConfig: {
    slug: 'test-enterprise-slug',
  },
};

const userSubsidyState = {
  subscriptionLicense: {
    uuid: 'test-license-uuid',
  },
  couponCodes: {
    couponCodes: [],
    couponCodesCount: 0,
  },
};

const pathwayData = camelCaseObject(LearnerPathwayProgressData[0]);
describe('<PathwayProgressCard />', () => {
  it('renders all data related to pathway progress correctly', () => {
    const { getByAltText } = render(<PathwayProgressListingCardWithContext
      initialAppState={appState}
      initialUserSubsidyState={userSubsidyState}
      pathwayData={pathwayData}
    />);
    const { learnerPathwayProgress } = pathwayData;
    expect(screen.getByText(learnerPathwayProgress.title)).toBeInTheDocument();
    const cardImageNode = getByAltText('dug');
    expect(cardImageNode).toHaveAttribute('src', learnerPathwayProgress.cardImage);
    expect(screen.getByText('Remaining')).toBeInTheDocument();
    expect(screen.getByTestId('remaining-count')).toHaveTextContent('1');
    expect(screen.getByText('In progress')).toBeInTheDocument();
    expect(screen.getByTestId('in-progress-count')).toHaveTextContent('3');
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByTestId('completed-count')).toHaveTextContent('1');
  });

  it('redirects to correct page when clicked', () => {
    const { container } = render(<PathwayProgressListingCardWithContext
      initialAppState={appState}
      initialUserSubsidyState={userSubsidyState}
      pathwayData={pathwayData}
    />);
    fireEvent.click(container.firstElementChild);
    expect(mockedPush).toHaveBeenCalledWith('/test-enterprise-slug/pathway/0a017cbe-0f1c-4e5f-9095-2101823fac93/progress');
  });
});
