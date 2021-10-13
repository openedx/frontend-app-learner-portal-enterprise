import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { ProgramContextProvider } from '../ProgramContextProvider';
import ProgramInstructors from '../ProgramInstructors';

// eslint-disable-next-line react/prop-types
const ProgramInstructorsWithContext = ({ initialState = {} }) => (
  <ProgramContextProvider initialState={initialState}>
    <ProgramInstructors />
  </ProgramContextProvider>
);

describe('<ProgramInstructors />', () => {
  const initialState = {
    program: {
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
    },
  };

  test('renders program authoring organizations', () => {
    render(<ProgramInstructorsWithContext initialState={initialState} />);
    initialState.program.authoringOrganizations.forEach((org) => {
      expect(screen.queryByText(org.name)).toBeInTheDocument();
      expect(screen.getByAltText(`${org.name} logo`)).toHaveAttribute('src', org.logoImageUrl);
      expect(screen.getByRole('link', { name: org.name })).toHaveAttribute('href', org.marketingUrl);
    });
  });

  test('renders program instructors', () => {
    render(<ProgramInstructorsWithContext initialState={initialState} />);
    initialState.program.staff.forEach((staff) => {
      const fullName = `${staff.givenName} ${staff.familyName}`;
      expect(screen.queryByText(fullName)).toBeInTheDocument();
      expect(screen.getByAltText(fullName)).toHaveAttribute('src', staff.profileImageUrl);
      expect(screen.getByRole('link', { name: fullName })).toHaveAttribute('href', `undefined/bio/${staff.slug}`);
      expect(screen.queryByText(staff.position.title)).toBeInTheDocument();
      expect(screen.queryByText(staff.position.organizationName)).toBeInTheDocument();
    });
  });
});
