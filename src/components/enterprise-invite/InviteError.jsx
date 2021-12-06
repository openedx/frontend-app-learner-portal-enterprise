import React from 'react';
import {
  Alert,
  AvatarButton,
  Button,
  Container,
  Hyperlink,
  OverlayTrigger,
  Tooltip,
  Navbar,
  Dropdown,
} from '@edx/paragon';
import { Info } from '@edx/paragon/icons';
import edXLogo from '@edx/brand/logo.svg';
import SiteFooter from '@edx/frontend-component-footer';
import { getConfig } from '@edx/frontend-platform/config';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

const InviteErrorHeader = () => {
  const config = getConfig();
  const authenticatedUser = getAuthenticatedUser();
  const { username, profileImage } = authenticatedUser;

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
          <Dropdown>
            <Dropdown.Toggle showLabel as={AvatarButton} src={profileImage.imageUrlMedium}>
              {username}
            </Dropdown.Toggle>
            <Dropdown.Menu
              style={{ maxWidth: 280 }}
              alignRight
            >
              <Dropdown.Item href={`${config.LOGOUT_URL}?next=${global.location}`}>Sign out</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Container>
      </Navbar>
    </header>
  );
};

const InviteError = () => {
  const config = getConfig();

  return (
    <>
      <InviteErrorHeader />
      <main id="content">
        <Container className="py-4">
          <Alert
            variant="danger"
            icon={Info}
            actions={[
              <OverlayTrigger
                placement="left"
                overlay={(
                  <Tooltip id="continue-edx-tooltip">
                    You will not have access to subsidized content until your edX
                    account is linked to your organization.
                  </Tooltip>
                )}
              >
                <Button
                  as="a"
                  href={config.MARKETING_SITE_BASE_URL}
                  variant="primary"
                  size="sm"
                >
                  Continue to edX.org
                </Button>
              </OverlayTrigger>,
            ]}
          >
            <Alert.Heading>An error occurred while processing your invite</Alert.Heading>
            <p>
              Please reach out to your organization&apos;s edX administrator with any questions or
              visit the <Hyperlink destination={config.LEARNER_SUPPORT_URL} target="_blank">edX Help Center</Hyperlink>.
            </p>
          </Alert>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
};

export default InviteError;
