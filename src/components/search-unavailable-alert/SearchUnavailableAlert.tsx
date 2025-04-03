import PropTypes from 'prop-types';
import { Alert } from '@openedx/paragon';
import { Error as ErrorIcon } from '@openedx/paragon/icons';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';

interface SearchUnavailableAlertProps {
  className?: string;
}

export const messages = defineMessages({
  alertHeading: {
    id: 'enterprise.learner_portal.algolia_search_unavailable.alert.heading',
    defaultMessage: 'Search Unavailable',
    description: 'Heading for the alert that is displayed when the search service is unavailable.',
  },
  alertText: {
    id: 'enterprise.learner_portal.algolia_search_unavailable.alert.text',
    defaultMessage: 'We\'re unable to connect to our search service at the moment. This means search functionality is currently unavailable.',
    description: 'Text for the alert that is displayed when the search service is unavailable.',
  },
  alertTextOptionsHeader: {
    id: 'enterprise.learner_portal.algolia_search_unavailable.alert.text.options.header',
    defaultMessage: 'What you can do:',
    description: 'Header for the list of options for the alert that is displayed when the search service is unavailable.',
  },
  alertTextOptionRefresh: {
    id: 'enterprise.learner_portal.algolia_search_unavailable.alert.text.option.refresh',
    defaultMessage: 'Refresh the page to try again.',
    description: 'Option for the alert that is displayed when the search service is unavailable.',
  },
  alertTextOptionNetwork: {
    id: 'enterprise.learner_portal.algolia_search_unavailable.alert.text.option.network',
    defaultMessage: 'Check your network connection.',
    description: 'Option for the alert that is displayed when the search service is unavailable.',
  },
  alertTextOptionSupport: {
    id: 'enterprise.learner_portal.algolia_search_unavailable.alert.text.option.support',
    defaultMessage: 'If the issue persists, please contact your administrator or our support team.',
    description: 'Option for the alert that is displayed when the search service is unavailable.',
  },
});

const SearchUnavailableAlert: React.FC<SearchUnavailableAlertProps> = ({ className }) => {
  const intl = useIntl();
  return (
    <Alert data-testid="search-error-alert" variant="danger" icon={ErrorIcon} className={className}>
      <Alert.Heading>{intl.formatMessage(messages.alertHeading)}</Alert.Heading>
      <p>
        {intl.formatMessage(messages.alertText)}
      </p>
      <span className="font-weight-bold">{intl.formatMessage(messages.alertTextOptionsHeader)}</span>
      <ul>
        <li>{intl.formatMessage(messages.alertTextOptionRefresh)}</li>
        <li>{intl.formatMessage(messages.alertTextOptionNetwork)}</li>
        <li>{intl.formatMessage(messages.alertTextOptionSupport)}</li>
      </ul>
    </Alert>
  );
};

SearchUnavailableAlert.propTypes = {
  className: PropTypes.string,
};

export default SearchUnavailableAlert;
