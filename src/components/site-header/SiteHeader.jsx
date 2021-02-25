import React, { useContext } from 'react';
import Responsive from 'react-responsive';
import { Link, NavLink } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { AppContext } from '@edx/frontend-platform/react';
import { Menu as MenuIcon } from '@edx/paragon/icons';
import { Container } from '@edx/paragon';
import edXLogo from '@edx/brand/logo.svg';

import { Menu, MenuTrigger, MenuContent } from './menu';
import AvatarDropdown from './AvatarDropdown';

export default function SiteHeader() {
  const { enterpriseConfig } = useContext(AppContext);

  const renderLogo = () => (
    <Link to={`/${enterpriseConfig.slug}`} className="logo">
      <img
        className="d-block"
        src={enterpriseConfig.branding.logo || edXLogo}
        alt={`${enterpriseConfig.name} logo`}
      />
    </Link>
  );

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
            <a href="https://support.edx.org/hc/en-us" className="text-gray-700 mr-3">
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
      <Responsive maxWidth={768}>
        {renderMobileHeader()}
      </Responsive>
      <Responsive minWidth={769}>
        {renderDesktopHeader()}
      </Responsive>
    </>
  );
}
