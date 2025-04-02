import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { SearchUnavailableAlert } from '../index';
import { messages } from '../SearchUnavailableAlert';

describe('<SearchUnavailableAlert />', () => {
  it('renders with expected content', () => {
    render(
      <IntlProvider locale="en">
        <SearchUnavailableAlert />
      </IntlProvider>,
    );
    Object.entries(messages).forEach(([, message]: [string, { defaultMessage: string }]) => {
      expect(screen.getByText((message as { defaultMessage: string }).defaultMessage)).toBeInTheDocument();
    });
  });
  it('renders with expected passed classname', () => {
    render(
      <IntlProvider locale="en">
        <SearchUnavailableAlert className="pikachu" />
      </IntlProvider>,
    );
    expect(screen.getByTestId('search-error-alert').className).toContain('pikachu');
  });
});
