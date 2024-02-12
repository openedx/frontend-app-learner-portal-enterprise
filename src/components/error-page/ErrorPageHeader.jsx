import React, { useContext } from 'react';
import {
  AvatarButton,
  Container,
  Navbar,
  Dropdown,
} from '@edx/paragon';
import edXLogo from '@edx/brand/logo.svg';
import { AppContext } from '@edx/frontend-platform/react';

/**
 * React component for the invite page error case. Renders a minimal header
 * with just a logo that is not linked.
 *
 * This component also acts as a message page for the logout case, hence adding some checks for
 * non existent variables.
 */
const ErrorPageHeader = () => {
  const { authenticatedUser, config } = useContext(AppContext);
  const { username, name, profileImage } = authenticatedUser || { username: '', name: '', profileImage: '' };
  const hideUsername = config.HIDE_USERNAME_FROM_HEADER;

  return (
    <header>
      <Navbar bg="white" expand="lg" className="border-bottom">
        <Container>
          <Navbar.Brand>
            <img
              src={edXLogo}
              alt="edX logo"
              width={50}
            />
          </Navbar.Brand>
          <nav aria-label="Secondary" className="nav secondary-menu-container align-items-center ml-auto">
            <a href={config.LEARNER_SUPPORT_URL} className="text-gray-700 mr-3">
              Help
            </a>
            {/* this section makes sense only if the user is logged in */}
            {username && (
              <Dropdown>
                <Dropdown.Toggle
                  id="error-page-header-avatar-button-dropdown-toggle"
                  as={AvatarButton}
                  src={profileImage?.imageUrlMedium}
                  showLabel={!hideUsername}
                >
                  {hideUsername ? name : username}
                </Dropdown.Toggle>
                <Dropdown.Menu
                  style={{ maxWidth: 280 }}
                  alignRight
                >
                  <Dropdown.Item href={`${config.LOGOUT_URL}?next=${global.location}`}>Sign out</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </nav>
        </Container>
      </Navbar>
    </header>
  );
};

export default ErrorPageHeader;
