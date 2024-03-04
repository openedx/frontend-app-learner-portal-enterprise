import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import ProgramPathwayOpportunity from '../ProgramPathwayOpportunity';

describe('<ProgramPathwayOpportunity />', () => {
  const mockPathways = [
    {
      name: 'Pathway 1',
      description: 'Description for pathway 1',
      destinationUrl: 'https://example.com/pathway1',
      uuid: '1',
    },
    {
      name: 'Pathway 2',
      description: 'Description for pathway 2',
      destinationUrl: 'https://example.com/pathway2',
      uuid: '2',
    },
  ];

  it('renders the correct content', () => {
    render(
      <IntlProvider locale="en">
        <ProgramPathwayOpportunity
          pathways={mockPathways}
          title="Mock Title"
          pathwayClass="mock-class"
        />
      </IntlProvider>,
    );

    expect(screen.getByText('Mock Title')).toBeInTheDocument();

    mockPathways.forEach((pathway) => {
      expect(screen.getByText(pathway.name)).toBeInTheDocument();
      expect(screen.getByText(pathway.description)).toBeInTheDocument();
    });
  });
});
