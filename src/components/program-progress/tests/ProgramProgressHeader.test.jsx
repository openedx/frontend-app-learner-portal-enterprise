import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import ProgramProgressHeader from '../ProgramProgressHeader';
import { getProgramIcon } from '../data/utils';
import { useProgramProgressDetails } from '../../app/data';

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useProgramProgressDetails: jest.fn(),
}));

const ProgramProgressHeaderWithContext = () => (
  <ProgramProgressHeader />
);

const testProgramData = {
  type: 'MicroMasters',
  title: 'Test Program',
  authoringOrganizations: [{
    name: 'Test Author Org',
    certificateLogoImageUrl: 'https://logo.image.url',
  }],
};

const mockProgram = {
  programData: testProgramData,
};

describe('<ProgramProgressHeader />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useProgramProgressDetails.mockReturnValue({ data: mockProgram });
  });
  it('renders program progress header with correct data', () => {
    const programIcon = getProgramIcon(testProgramData.type);

    const { container } = render(
      <ProgramProgressHeaderWithContext />,
    );
    expect(screen.getByText(testProgramData.title)).toBeInTheDocument();
    expect(container.querySelector('img')).toHaveAttribute('src', programIcon);
    expect(container.querySelector('#org-image')).toHaveAttribute(
      'src',
      testProgramData.authoringOrganizations[0].certificateLogoImageUrl,
    );
  });
});
