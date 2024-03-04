import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import SkillsQuizHeaderV2 from '../SkillsQuizHeader';

describe('<SkillsQuizHeaderV2 />', () => {
  it('renders the edX logo with correct attributes', () => {
    render(<IntlProvider locale="en"><SkillsQuizHeaderV2 /></IntlProvider>);

    expect(screen.getByAltText('edx-logo')).toBeInTheDocument();
  });

  it('renders the heading and subheading correctly', () => {
    render(<IntlProvider locale="en"><SkillsQuizHeaderV2 /></IntlProvider>);

    expect(screen.getByText('Skills Builder')).toBeInTheDocument();
    expect(screen.getByText('Let edX be your guide')).toBeInTheDocument();
  });
});
