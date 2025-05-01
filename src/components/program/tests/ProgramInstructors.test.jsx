import { IntlProvider } from '@edx/frontend-platform/i18n';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import ProgramInstructors from '../ProgramInstructors';
import { useEnterpriseCustomer, useProgramDetails } from '../../app/data';
import { enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useProgramDetails: jest.fn(),
}));

const initialState = {
  authoringOrganizations: [
    {
      name: 'S.H.I.E.L.D',
      logoImageUrl: '/media/organization/logos/shield.png',
      marketingUrl: 'school/shield',
    },
  ],
  staff: [
    {
      givenName: 'Nicholas Joseph',
      familyName: 'Fury',
      slug: 'nick-fury',
      position: {
        title: 'The Unseen',
        organizationName: 'Supreme Headquarters, International Espionage and Law-Enforcement Division',
      },
      profileImageUrl: '/media/people/profile_images/nick_fury.png',
    },
    {
      givenName: 'Anthony Edward',
      familyName: 'Stark',
      slug: 'tony-fury',
      position: {
        title: 'Iron Man',
        organizationName: 'AVENGERS',
      },
      profileImageUrl: '/media/people/profile_images/tony_stark.png',
    },
  ],
};

const mockEnterpriseCustomer = enterpriseCustomerFactory();

const ProgramInstructorsWrapper = () => (
  <IntlProvider locale="en">
    <ProgramInstructors />
  </IntlProvider>
);

describe('<ProgramInstructors />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useProgramDetails.mockReturnValue({ data: initialState });
  });

  test('renders program authoring organizations', () => {
    render(<ProgramInstructorsWrapper />);
    initialState.authoringOrganizations.forEach((org) => {
      expect(screen.getByAltText(`${org.name} logo`)).toHaveAttribute('src', org.logoImageUrl);
      expect(screen.getByText(org.name)).toHaveAttribute('href', org.marketingUrl);
    });
  });

  test('renders program instructors', () => {
    render(<ProgramInstructorsWrapper />);
    initialState.staff.forEach((staff) => {
      const fullName = `${staff.givenName} ${staff.familyName}`;
      expect(screen.queryByText(fullName)).toBeInTheDocument();
      expect(screen.getByAltText(fullName)).toHaveAttribute('src', staff.profileImageUrl);
      expect(screen.getByText(fullName)).toHaveAttribute('href', `undefined/bio/${staff.slug}`);
      expect(screen.queryByText(staff.position.title)).toBeInTheDocument();
      expect(screen.queryByText(staff.position.organizationName)).toBeInTheDocument();
    });
  });
});
