import { useIntl } from '@edx/frontend-platform/i18n';
import { NavLink } from 'react-router-dom';

import {
  useContentHighlightsConfiguration,
  useEnterpriseLearner,
} from '../app/App';

const SiteHeaderNavMenu = () => {
  const { data: { activeEnterpriseCustomer } } = useEnterpriseLearner();
  const { data: contentHighlightsConfiguration } = useContentHighlightsConfiguration();
  const intl = useIntl();
  const mainMenuLinkClassName = 'nav-link';

  if (activeEnterpriseCustomer.disableSearch) {
    return null;
  }

  return (
    <>
      <NavLink to={`/${activeEnterpriseCustomer.slug}`} className={mainMenuLinkClassName} end>
        {intl.formatMessage({
          id: 'site.header.nav.dashboard.title',
          defaultMessage: 'Dashboard',
          description: 'Dashboard link title in site header navigation.',
        })}
      </NavLink>
      {!contentHighlightsConfiguration?.canOnlyViewHighlightSets && (
        <NavLink to={`/${activeEnterpriseCustomer.slug}/search`} className={mainMenuLinkClassName}>
          {intl.formatMessage({
            id: 'site.header.nav.search.title',
            defaultMessage: 'Find a Course',
            description: 'Find a course link in site header navigation.',
          })}
        </NavLink>
      )}
    </>
  );
};

export default SiteHeaderNavMenu;
