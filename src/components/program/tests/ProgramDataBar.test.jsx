import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import {
  screen, render, fireEvent,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import ProgramDataBar from '../ProgramDataBar';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';
import { useEnterpriseCustomer, useProgramDetails } from '../../app/data';

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useProgramDetails: jest.fn(),
}));

const mockAuthenticatedUser = authenticatedUserFactory();

const initialAppState = {
  authenticatedUser: mockAuthenticatedUser,
};

const ProgramDataBarWithContext = () => (
  <AppContext.Provider value={initialAppState}>
    <ProgramDataBar />
  </AppContext.Provider>
);

const programState = {
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
};

const mockEnterpriseCustomer = enterpriseCustomerFactory();

describe('<ProgramDataBar />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useProgramDetails.mockReturnValue({ data: programState });
  });
  it('renders organization logo image', () => {
    const { getByAltText } = render(<ProgramDataBarWithContext />);
    const logoImageNode = getByAltText(programState.authoringOrganizations[0].name);
    expect(logoImageNode).toHaveAttribute('src', programState.authoringOrganizations[0].logoImageUrl);
  });

  it('renders I\'m interested Button when eligible for one click purchase', () => {
    render(<ProgramDataBarWithContext />);
    expect(screen.getByText('I\'m interested')).toBeInTheDocument();
  });

  it('does not render I\'m interested Button when not eligible for one click purchase', () => {
    const newProgram = { ...programState };
    newProgram.isProgramEligibleForOneClickPurchase = false;
    useProgramDetails.mockReturnValue({ data: newProgram });
    render(<ProgramDataBarWithContext />);
    expect(screen.queryByText('I\'m interested')).not.toBeInTheDocument();
  });

  it('tests stickiness and non stickiness of data bar on scroll', () => {
    const { container } = render(<ProgramDataBarWithContext />);
    const dataBar = container.getElementsByClassName('data-bar')[0];
    const topPositionOfDataBar = dataBar.getBoundingClientRect().top + window.scrollY;
    const downPositionOfDataBar = dataBar.getBoundingClientRect().bottom + window.scrollY;
    fireEvent.scroll(window, { target: { scrollY: topPositionOfDataBar + 1 } });
    expect(container.getElementsByClassName('data-bar')[0].classList.contains('stuck')).toBeTruthy();
    fireEvent.scroll(window, { target: { scrollY: downPositionOfDataBar } });
    expect(container.getElementsByClassName('data-bar')[0].classList.contains('stuck')).toBeFalsy();
  });
});
