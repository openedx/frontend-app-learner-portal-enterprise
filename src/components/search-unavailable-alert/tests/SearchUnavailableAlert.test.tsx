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
    expect(screen.getByText(messages.alertHeading.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.alertText.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.alertTextOptionsHeader.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.alertTextOptionRefresh.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.alertTextOptionNetwork.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.alertTextOptionSupport.defaultMessage)).toBeInTheDocument();
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
