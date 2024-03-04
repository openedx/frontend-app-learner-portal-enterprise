import { AppContext } from '@edx/frontend-platform/react';
import { useContext } from 'react';
import { Helmet } from 'react-helmet';
import { Outlet } from 'react-router-dom';
import SiteFooter from '@edx/frontend-component-footer';

import { useEnterpriseLearner, isSystemMaintenanceAlertOpen } from './data';
import { useStylesForCustomBrandColors } from '../layout/data/hooks';
import NotFoundPage from '../NotFoundPage';
import { SiteHeader } from '../site-header';
import { EnterpriseBanner } from '../enterprise-banner';
import { SystemWideWarningBanner } from '../system-wide-banner';

export const TITLE_TEMPLATE = '%s - edX';
export const DEFAULT_TITLE = 'edX';

const Layout = () => {
  const { config } = useContext(AppContext);
  const { data: enterpriseLearnerData } = useEnterpriseLearner();

  const brandStyles = useStylesForCustomBrandColors(enterpriseLearnerData.enterpriseCustomer);

  // Authenticated user is NOT linked an enterprise customer, so
  // render the not found page.
  if (!enterpriseLearnerData.enterpriseCustomer) {
    return <NotFoundPage />;
  }

  return (
    <>
      <Helmet titleTemplate={TITLE_TEMPLATE} defaultTitle={DEFAULT_TITLE}>
        <html lang="en" />
        {brandStyles.map(({ key, styles }) => (
          <style key={key} type="text/css">{styles}</style>
        ))}
      </Helmet>
      {isSystemMaintenanceAlertOpen(config) && (
        <SystemWideWarningBanner>
          {config.MAINTENANCE_ALERT_MESSAGE}
        </SystemWideWarningBanner>
      )}
      <SiteHeader />
      <EnterpriseBanner />
      <main id="content" className="fill-vertical-space">
        <Outlet />
      </main>
      <SiteFooter />
    </>
  );
};

export default Layout;
