import { useIntl } from '@edx/frontend-platform/i18n';
import { NavLink } from 'react-router-dom';
import { useEnterpriseCustomer, useIsAssignmentsOnlyLearner } from '../app/data';
import { useContentDiscoveryNavLink } from './data';

const SiteHeaderNavMenu = () => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const isAssignmentOnlyLearner = useIsAssignmentsOnlyLearner();
  const intl = useIntl();
  const mainMenuLinkClassName = 'nav-link';
  const contentDiscoveryNavLink = useContentDiscoveryNavLink(mainMenuLinkClassName);

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
      {!isAssignmentOnlyLearner && contentDiscoveryNavLink}
    </>
  );
};

export default SiteHeaderNavMenu;
