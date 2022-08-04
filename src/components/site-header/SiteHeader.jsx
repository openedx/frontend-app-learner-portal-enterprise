import React, { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform/config';
import { Menu as MenuIcon } from '@edx/paragon/icons';
import { Container, MediaQuery } from '@edx/paragon';
import edXLogo from '@edx/brand/logo.svg';

import { Menu, MenuTrigger, MenuContent } from './menu';
import AvatarDropdown from './AvatarDropdown';

export default function SiteHeader() {
  const config = getConfig();
  const { enterpriseConfig } = useContext(AppContext);

  const renderLogo = () => {
    const image = (
      <img
        className="d-block logo"
        src={enterpriseConfig.branding.logo || edXLogo}
        alt={`${enterpriseConfig.name} logo`}
        data-testid="header-logo-image-id"
      />
    );
    if (enterpriseConfig.disableSearch) {
      return image;
    }
    return (
      <Link to={`/${enterpriseConfig.slug}`} data-testid="header-logo-link-id">
        {image}
      </Link>
    );
  };

  const renderMainMenu = () => {
    const mainMenuLinkClassName = 'nav-link';
    if (enterpriseConfig.disableSearch) {
      return null;
    }
    return (
      <>
        <NavLink to={`/${enterpriseConfig.slug}`} className={mainMenuLinkClassName} exact>
          Dashboard
        </NavLink>
        <NavLink to={`/${enterpriseConfig.slug}/search`} className={mainMenuLinkClassName} exact>
          Find a Course
        </NavLink>
      </>
    );
  };

  const renderDesktopHeader = () => (
    <header className="site-header-desktop">
      <Container size="lg">
        <div className="nav-container position-relative d-flex align-items-center">
          {renderLogo()}
          <nav aria-label="Main" className="nav main-nav">
            {renderMainMenu()}
          </nav>
          <nav aria-label="Secondary" className="nav secondary-menu-container align-items-center ml-auto">
            <a href={config.LEARNER_SUPPORT_URL} className="text-gray-700 mr-3">
              Help
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
              {renderMainMenu()}
            </MenuContent>
          </Menu>
        </div>
        <div className="w-100 d-flex justify-content-center">
          {renderLogo()}
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
}
