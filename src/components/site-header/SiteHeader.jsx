import React, { useContext } from 'react';
import Responsive from 'react-responsive';

import { Link } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import Avatar from './Avatar';
import { Menu, MenuTrigger, MenuContent } from './menu';

import edXLogo from '../../assets/edx-logo.svg';
import { ReactComponent as MenuIcon } from '../../assets/icons/menu.svg';
import { ReactComponent as CaretIcon } from '../../assets/icons/caret.svg';

const INTERNAL_LINK_TYPE = 'internal';

export default function SiteHeader() {
  const authenticatedUser = getAuthenticatedUser();
  const { username, profileImage } = authenticatedUser;
  const { enterpriseConfig, config } = useContext(AppContext);

  const dashboardLink = `/${enterpriseConfig.slug}`;
  const userMenuItems = [
    {
      type: INTERNAL_LINK_TYPE,
      href: dashboardLink,
      content: 'Dashboard',
    },
    {
      href: `${config.LMS_BASE_URL}/u/${authenticatedUser.username}`,
      content: 'My Profile',
    },
    {
      href: `${config.LMS_BASE_URL}/account/settings`,
      content: 'Account Settings',
    },
    {
      href: 'https://support.edx.org/hc/en-us',
      content: 'Help',
    },
    {
      href: `${config.LOGOUT_URL}?next=${config.BASE_URL}${dashboardLink}`,
      content: 'Sign Out',
    },
  ];

  const renderLogo = () => (
    <Link
      to={dashboardLink}
      className="logo"
    >
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
        <Link to={`/${enterpriseConfig.slug}`} className={mainMenuLinkClassName}>
          Dashboard
        </Link>
        <Link to={`/${enterpriseConfig.slug}/search`} className={mainMenuLinkClassName}>
          Find a Course
        </Link>
        <a href="https://support.edx.org/hc/en-us" className={mainMenuLinkClassName}>
          Help
        </a>
      </>
    );
  };

  const renderDesktopUserMenu = () => {
    const desktopMenuLinkClassName = 'dropdown-item';

    return (
      <Menu transitionClassName="menu-dropdown" transitionTimeout={250}>
        <MenuTrigger
          tag="button"
          aria-label={`Account menu for ${username}`}
          className="btn btn-light d-inline-flex align-items-center pl-2 pr-3"
        >
          <Avatar size="1.5em" src={profileImage.imageUrlMedium} alt="" className="mr-2" />
          {username} <CaretIcon role="img" aria-hidden focusable="false" />
        </MenuTrigger>
        <MenuContent className="mb-0 dropdown-menu show dropdown-menu-right pin-right shadow py-2">
          {userMenuItems.map((menuItem) => {
            const {
              type,
              href,
              content,
            } = menuItem;

            if (type === INTERNAL_LINK_TYPE) {
              return (
                <Link key={content} className={desktopMenuLinkClassName} to={href}>
                  {content}
                </Link>
              );
            }
            return (
              <a key={content} className={desktopMenuLinkClassName} href={href}>
                {content}
              </a>
            );
          })}
        </MenuContent>
      </Menu>
    );
  };

  const renderDesktopHeader = () => (
    <header className="site-header-desktop">
      <div className="container-fluid">
        <div className="nav-container position-relative d-flex align-items-center">
          {renderLogo()}
          <nav aria-label="Main" className="nav main-nav">
            {renderMainMenu()}
          </nav>
          <nav aria-label="Secondary" className="nav secondary-menu-container align-items-center ml-auto">
            {renderDesktopUserMenu()}
          </nav>
        </div>
      </div>
    </header>
  );

  const renderMobileUserMenu = () => {
    const mobileMenuLinkClassName = 'nav-link';
    return userMenuItems.map((menuItem) => {
      const {
        type,
        href,
        content,
      } = menuItem;

      return (
        <li className="nav-item" key={content}>
          {type === INTERNAL_LINK_TYPE ? (
            <Link className={mobileMenuLinkClassName} to={href}>
              {content}
            </Link>
          ) : (
            <a className={mobileMenuLinkClassName} href={href}>
              {content}
            </a>
          )}
        </li>
      );
    });
  };

  const renderMobileHeader = () => {
    const mainMenuTitle = 'Main Menu';
    const accountMenuTitle = 'Account Menu';

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
        <div className="w-100 d-flex justify-content-end align-items-center">
          <Menu tag="nav" aria-label="secondary" className="position-static">
            <MenuTrigger
              tag="button"
              className="icon-button"
              aria-label={accountMenuTitle}
              title={accountMenuTitle}
            >
              <Avatar size="1.5rem" src={authenticatedUser.profileImage.imageUrlMedium} alt={authenticatedUser.username} />
            </MenuTrigger>
            <MenuContent tag="ul" className="nav flex-column pin-left pin-right border-top shadow py-2">
              {renderMobileUserMenu()}
            </MenuContent>
          </Menu>
        </div>
      </header>
    );
  };

  return (
    <>
      <div className="position-absolute">
        <a href="#content" className="skip-nav-link sr-only sr-only-focusable btn btn-primary px-2 py-1 mt-3 ml-2">Skip to main content</a>
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
