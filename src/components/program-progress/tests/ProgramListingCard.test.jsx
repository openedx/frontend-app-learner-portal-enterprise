import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import {
  screen, render,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import userEvent from '@testing-library/user-event';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';

import ProgramListingCard from '../ProgramListingCard';

const mockedPush = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockedPush,
  }),
  useLocation: jest.fn(),
}));

const ProgramListingCardWithContext = ({ initialAppState, initialUserSubsidyState, programData }) => (
  <AppContext.Provider value={initialAppState}>
    <UserSubsidyContext.Provider value={initialUserSubsidyState}>
      <ProgramListingCard program={programData} />
    </UserSubsidyContext.Provider>
  </AppContext.Provider>
);

const appState = {
  enterpriseConfig: {
    slug: 'test-enterprise-slug',
  },
};
const dummyProgramData = {
  uuid: 'test-uuid',
  title: 'Test Program Title',
  type: 'MicroMasters',
  cardImageUrl: 'https://image.url',
  authoringOrganizations: [
    {
      key: 'test-key',
      logoImageUrl: '/media/organization/logos/shield.png',
    },
  ],
  progress: {
    inProgress: 1,
    completed: 2,
    notStarted: 3,
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

describe('<ProgramListingCard />', () => {
  it('renders all data for program', () => {
    const { getByAltText } = render(<ProgramListingCardWithContext
      initialAppState={appState}
      initialUserSubsidyState={userSubsidyState}
      programData={dummyProgramData}
    />);
    expect(screen.getByText(dummyProgramData.title)).toBeInTheDocument();
    expect(screen.getByText(dummyProgramData.type)).toBeInTheDocument();
    expect(screen.getByText(dummyProgramData.authoringOrganizations[0].key)).toBeInTheDocument();
    const logoImageNode = getByAltText(dummyProgramData.authoringOrganizations[0].key);
    expect(logoImageNode).toHaveAttribute('src', dummyProgramData.authoringOrganizations[0].logoImageUrl);
    expect(screen.getByText(dummyProgramData.progress.inProgress)).toBeInTheDocument();
    expect(screen.getByText('In progress')).toBeInTheDocument();
    expect(screen.getByText(dummyProgramData.progress.completed)).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText(dummyProgramData.progress.notStarted)).toBeInTheDocument();
    expect(screen.getByText('Remaining')).toBeInTheDocument();
  });

  it('renders names of all organizations when more than one', () => {
    const dummyDataWithMultipleOrgs = { ...dummyProgramData };
    dummyDataWithMultipleOrgs.authoringOrganizations.push({
      key: 'test-key2',
      logoImageUrl: '/media/organization/logos/shield.png',
    });
    render(<ProgramListingCardWithContext
      initialAppState={appState}
      initialUserSubsidyState={userSubsidyState}
      programData={dummyDataWithMultipleOrgs}
    />);
    const aggregatedOrganizations = dummyDataWithMultipleOrgs.authoringOrganizations.map(org => org.key).join(', ');
    expect(screen.getByText(aggregatedOrganizations)).toBeInTheDocument();
  });

  it('doesnt render logo of organizations when more than one', () => {
    const dummyDataWithMultipleOrg = { ...dummyProgramData };
    dummyDataWithMultipleOrg.authoringOrganizations.push({
      key: 'test-key2',
      logoImageUrl: '/media/organization/logos/shield.png',
    });
    const { queryByAltText } = render(<ProgramListingCardWithContext
      initialAppState={appState}
      initialUserSubsidyState={userSubsidyState}
      programData={dummyDataWithMultipleOrg}
    />);
    const logoImageNode = queryByAltText(dummyProgramData.authoringOrganizations[0].key);
    expect(logoImageNode).toBeNull();
  });

  it('redirects to correct page when clicked', () => {
    const { container } = render(<ProgramListingCardWithContext
      initialAppState={appState}
      initialUserSubsidyState={userSubsidyState}
      programData={dummyProgramData}
    />);
    userEvent.click(container.firstElementChild);
    expect(mockedPush).toHaveBeenCalledWith('/test-enterprise-slug/program/test-uuid/progress');
  });
});
