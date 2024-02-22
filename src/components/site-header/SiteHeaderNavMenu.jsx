import { useIntl } from '@edx/frontend-platform/i18n';
import { NavLink } from 'react-router-dom';
import { useEnterpriseLearner } from '../app/data';

const SiteHeaderNavMenu = () => {
  const { data: { enterpriseCustomer } } = useEnterpriseLearner();
  const intl = useIntl();
  const mainMenuLinkClassName = 'nav-link';

  // TODO: handle `disableSearch` upstream
  if (enterpriseCustomer.disableSearch) {
    return null;
  }

  return (
    <>
      <NavLink to={`/${enterpriseCustomer.slug}`} className={mainMenuLinkClassName} end>
        {intl.formatMessage({
          id: 'site.header.nav.dashboard.title',
          defaultMessage: 'Dashboard',
          description: 'Dashboard link title in site header navigation.',
        })}
      </NavLink>
      <NavLink to={`/${enterpriseCustomer.slug}/search`} className={mainMenuLinkClassName}>
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
