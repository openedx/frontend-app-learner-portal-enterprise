import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { FormattedMessage, IntlProvider } from '@edx/frontend-platform/i18n';
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
          title={(
            <FormattedMessage
              id="enterprise.dashboard.program.sidebar.credit.opportunities"
              defaultMessage="Additional Credit Opportunities"
              description="Title for additional credit opportunities on program sidebar"
            />
          )}
          pathwayClass="mock-class"
        />
      </IntlProvider>,
    );

    expect(screen.getByText('Additional Credit Opportunities')).toBeInTheDocument();

    mockPathways.forEach((pathway) => {
      expect(screen.getByText(pathway.name)).toBeInTheDocument();
      expect(screen.getByText(pathway.description)).toBeInTheDocument();
    });
  });
});
