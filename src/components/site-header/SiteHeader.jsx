import { useContext } from 'react';
import { HashLink } from 'react-router-hash-link';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform/config';
import { MenuIcon } from '@edx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Container, MediaQuery } from '@edx/paragon';

import SiteHeaderLogos from './SiteHeaderLogos';
import SiteHeaderNavMenu from './SiteHeaderNavMenu';
import { Menu, MenuTrigger, MenuContent } from './menu';
import AvatarDropdown from './AvatarDropdown';
import { useEnterpriseLearner } from '../app/App';

const SiteHeader = () => {
  const config = getConfig();
  const { data: { activeEnterpriseCustomer } } = useEnterpriseLearner();
  const intl = useIntl();

  const renderDesktopHeader = () => (
    <header className="site-header-desktop">
      <Container size="lg">
        <div className="nav-container position-relative d-flex align-items-center">
          <SiteHeaderLogos />
          <nav aria-label="Main" className="nav main-nav">
            <SiteHeaderNavMenu />
          </nav>
          <nav aria-label="Secondary" className="nav secondary-menu-container align-items-center ml-auto">
            <a href={config.LEARNER_SUPPORT_URL} className="text-gray-700 mr-3">
              {intl.formatMessage({
                id: 'site.header.nav.help.title',
                defaultMessage: 'Help',
                description: 'Help link in site header navigation.',
              })}
            </a>
            <AvatarDropdown />
          </nav>
        </div>
      </Container>
    </header>
  );

  const renderMobileHeader = () => {
    const mainMenuTitle = 'Main Menu';
    return (
      <header
        aria-label="Main"
        className="site-header-mobile d-flex justify-content-between align-items-center shadow"
      >
        <div className="w-100 d-flex justify-content-start">
          <Menu className="position-static">
            <MenuTrigger
              tag="button"
              className="icon-button"
              aria-label={mainMenuTitle}
              title={mainMenuTitle}
            >
              <MenuIcon role="img" aria-hidden focusable="false" style={{ width: '1.5rem', height: '1.5rem' }} />
            </MenuTrigger>
            <MenuContent
              tag="nav"
              aria-label="Main"
              className="nav flex-column pin-left pin-right border-top shadow py-2"
            >
              <SiteHeaderNavMenu enterpriseConfig={activeEnterpriseCustomer} />
            </MenuContent>
          </Menu>
        </div>
        <div className="w-100 d-flex justify-content-center">
          <SiteHeaderLogos enterpriseConfig={activeEnterpriseCustomer} />
        </div>
        <div className="w-100 d-flex justify-content-end">
          <AvatarDropdown showLabel={false} />
        </div>
      </header>
    );
  };

  return (
    <>
      <div className="position-absolute">
        <HashLink to="#content" className="skip-nav-link sr-only sr-only-focusable btn btn-primary mt-3 ml-2">
          Skip to main content
        </HashLink>
      </div>
      <MediaQuery maxWidth={768}>
        {renderMobileHeader()}
      </MediaQuery>
      <MediaQuery minWidth={769}>
        {renderDesktopHeader()}
      </MediaQuery>
    </>
  );
};

export default SiteHeader;
