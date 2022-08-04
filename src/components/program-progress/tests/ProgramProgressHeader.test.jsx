import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import ProgramProgressHeader from '../ProgramProgressHeader';
import { ProgramProgressContext } from '../ProgramProgressContextProvider';
import { getProgramIcon } from '../data/utils';

/* eslint-disable react/prop-types */
function ProgramProgressHeaderWithContext({
  initialProgramProgressContext = {},
}) {
  return (
    <ProgramProgressContext.Provider value={initialProgramProgressContext}>
      <ProgramProgressHeader />
    </ProgramProgressContext.Provider>
  );
}

const testProgramData = {
  type: 'MicroMasters',
  title: 'Test Program',
  authoringOrganizations: [{
    name: 'Test Author Org',
    certificateLogoImageUrl: 'https://logo.image.url',
  }],
};

describe('<ProgramProgressHeader />', () => {
  it('renders program progress header with correct data', () => {
    const initialProgramProgressContext = { programData: testProgramData };
    const programIcon = getProgramIcon(testProgramData.type);

    const { container } = render(
      <ProgramProgressHeaderWithContext
        initialProgramProgressContext={initialProgramProgressContext}
      />,
    );
    expect(screen.getByText(testProgramData.title)).toBeInTheDocument();
    expect(container.querySelector('img')).toHaveAttribute('src', programIcon);
    expect(container.querySelector('#org-image')).toHaveAttribute(
      'src',
      testProgramData.authoringOrganizations[0].certificateLogoImageUrl,
    );
  });
});
