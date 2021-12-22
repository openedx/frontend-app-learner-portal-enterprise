import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import {
  screen, render,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { ProgramContextProvider } from '../ProgramContextProvider';
import ProgramDataBar from '../ProgramDataBar';

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}));

/* eslint-disable react/prop-types */
const ProgramDataBarWithContext = ({ initialAppState, initialUserSubsidyState, initialProgramState }) => (
  <AppContext.Provider value={initialAppState}>
    <UserSubsidyContext.Provider value={initialUserSubsidyState}>
      <ProgramContextProvider initialState={initialProgramState}>
        <ProgramDataBar />
      </ProgramContextProvider>
    </UserSubsidyContext.Provider>
  </AppContext.Provider>
);

const appState = {
  enterpriseConfig: {
    slug: 'test-enterprise-slug',
  },
};
const programState = {
  program: {
    title: 'Test Program Title',
    type: 'MicroMasters',
    authoringOrganizations: [
      {
        key: 'test-key',
        name: 'S.H.I.E.L.D',
        logoImageUrl: '/media/organization/logos/shield.png',
        marketingUrl: 'school/shield',
      },
    ],
    isProgramEligibleForOneClickPurchase: true,
  },
};
const userSubsidyState = {
  subscriptionLicense: {
    uuid: 'test-license-uuid',
  },
  offers: {
    offers: [],
    offersCount: 0,
  },
};

describe('<ProgramDataBar />', () => {
  it('renders organization logo image', () => {
    const { getByAltText } = render(<ProgramDataBarWithContext
      initialAppState={appState}
      initialProgramState={programState}
      initialUserSubsidyState={userSubsidyState}
    />);
    const logoImageNode = getByAltText(programState.program.authoringOrganizations[0].name);
    expect(logoImageNode).toHaveAttribute('src', programState.program.authoringOrganizations[0].logoImageUrl);
  });

  it('renders I\'m interested Button when eligible for one click purchase', () => {
    render(<ProgramDataBarWithContext
      initialAppState={appState}
      initialProgramState={programState}
      initialUserSubsidyState={userSubsidyState}
    />);
    expect(screen.getByText('I\'m interested')).toBeInTheDocument();
  });

  it('does not render I\'m interested Button when not eligible for one click purchase', () => {
    const newProgram = { ...programState };
    newProgram.program.isProgramEligibleForOneClickPurchase = false;
    render(<ProgramDataBarWithContext
      initialAppState={appState}
      initialProgramState={newProgram}
      initialUserSubsidyState={userSubsidyState}
    />);
    expect(screen.queryByText('I\'m interested')).not.toBeInTheDocument();
  });
});
