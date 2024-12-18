import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import SkillsQuizHeader from '../SkillsQuizHeader';

describe('<SkillsQuizHeader />', () => {
  it('renders the edX logo with correct attributes', () => {
    render(<IntlProvider locale="en"><SkillsQuizHeader /></IntlProvider>);

    expect(screen.getByAltText('edx-logo')).toBeInTheDocument();
  });

  it('renders the heading and subheading correctly', () => {
    render(<IntlProvider locale="en"><SkillsQuizHeader /></IntlProvider>);

    expect(screen.getByText('Skills Builder')).toBeInTheDocument();
    expect(screen.getByText('Start your learning journey with edX')).toBeInTheDocument();
  });
});
