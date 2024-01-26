import React, { useContext } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { NavLink } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';

const SiteHeaderNavMenu = () => {
  const { enterpriseConfig } = useContext(AppContext);
  const intl = useIntl();
  const mainMenuLinkClassName = 'nav-link';

  if (enterpriseConfig.disableSearch) {
    return null;
  }

  return (
    <>
      <NavLink to={`/${enterpriseConfig.slug}`} className={mainMenuLinkClassName} end>
        {intl.formatMessage({
          id: 'site.header.nav.dashboard.title',
          defaultMessage: 'Dashboard',
          description: 'Dashboard link title in site header navigation.',
        })}
      </NavLink>
      <NavLink to={`/${enterpriseConfig.slug}/search`} className={mainMenuLinkClassName}>
        {intl.formatMessage({
          id: 'site.header.nav.search.title',
          defaultMessage: 'Find a Course',
          description: 'Find a course link in site header navigation.',
        })}
      </NavLink>
    </>
  );
};

export default SiteHeaderNavMenu;
