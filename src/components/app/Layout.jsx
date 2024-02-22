import { AppContext } from '@edx/frontend-platform/react';
import { useContext } from 'react';
import { Helmet } from 'react-helmet';
import { Outlet } from 'react-router-dom';
import SiteFooter from '@edx/frontend-component-footer';

import { useEnterpriseLearner } from './data';
import { useStylesForCustomBrandColors } from '../layout/data/hooks';
import NotFoundPage from '../NotFoundPage';
import DelayedFallbackContainer from '../DelayedFallback/DelayedFallbackContainer';
import { DEFAULT_TITLE, TITLE_TEMPLATE } from '../layout/Layout';
import { SiteHeader } from '../site-header';
import { EnterpriseBanner } from '../enterprise-banner';

const Layout = () => {
  const { authenticatedUser } = useContext(AppContext);
  const { data: enterpriseLearnerData } = useEnterpriseLearner();

  const brandStyles = useStylesForCustomBrandColors(enterpriseLearnerData.enterpriseCustomer);

  // Authenticated user is NOT linked an enterprise customer, so
  // render the not found page.
  if (!enterpriseLearnerData.enterpriseCustomer) {
    return <NotFoundPage />;
  }

  // User is authenticated with an active enterprise customer, but
  // the user account API data is still hydrating. If it is still
  // hydrating, render a loading state.
  if (!authenticatedUser.profileImage) {
    return (
      <DelayedFallbackContainer
        className="py-5 text-center"
        screenReaderText="Loading your account details. Please wait."
      />
    );
  }

  return (
    <>
      <Helmet titleTemplate={TITLE_TEMPLATE} defaultTitle={DEFAULT_TITLE}>
        <html lang="en" />
        {brandStyles.map(({ key, styles }) => (
          <style key={key} type="text/css">{styles}</style>
        ))}
      </Helmet>
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
