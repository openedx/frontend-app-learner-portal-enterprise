import { NavLink } from 'react-router-dom';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { useAcademies, useEnterpriseCustomer } from '../../../app/data';

export default function useContentDiscoveryNavLink(mainMenuLinkClassName) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { data: academies } = useAcademies();
  if (enterpriseCustomer.enableOneAcademy && academies.length === 1) {
    return (
      <NavLink to={`/${enterpriseCustomer.slug}/academies/${academies[0].uuid}`} className={mainMenuLinkClassName}>
        <FormattedMessage
          id="enterprise.dashboard.nav.academy.title"
          defaultMessage="Go to Academy"
          description="Go to academy link in site header navigation."
        />
      </NavLink>
    );
  }
  return (
    <NavLink to={`/${enterpriseCustomer.slug}/search`} className={mainMenuLinkClassName}>
      <FormattedMessage
        id="enterprise.dashboard.nav.find.course.title"
        defaultMessage="Find a Course"
        description="Find a course link in site header navigation."
      />
    </NavLink>
  );
}
