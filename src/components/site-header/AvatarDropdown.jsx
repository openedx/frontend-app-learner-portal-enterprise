import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform/config';
import { AppContext } from '@edx/frontend-platform/react';
import { AvatarButton, Dropdown } from '@edx/paragon';

const AvatarDropdown = ({ showLabel }) => {
  const {
    BASE_URL,
    LMS_BASE_URL,
    LOGOUT_URL,
    LEARNER_SUPPORT_URL,
  } = getConfig();
  const { enterpriseConfig, authenticatedUser } = useContext(AppContext);
  const { username, profileImage } = authenticatedUser;
  const enterpriseDashboardLink = `/${enterpriseConfig.slug}`;

  const idpPresent = enterpriseConfig.identity_providers.length > 0;
  // we insert the logout=true in this case to avoid the redirect back to IDP
  // which brings the user right back in, disallowing a proper logout
  const logoutHint = idpPresent ? `${encodeURIComponent('?')}logout=true` : '';
  const nextURL = `${BASE_URL}${enterpriseDashboardLink}${logoutHint}`;
  const logoutUrl = `${LOGOUT_URL}?next=${nextURL}`;
  return (
    <Dropdown>
      <Dropdown.Toggle showLabel={showLabel} as={AvatarButton} src={profileImage.imageUrlMedium}>
        {username}
      </Dropdown.Toggle>
      <Dropdown.Menu
        style={{ maxWidth: 280 }}
        alignRight
      >
        <Dropdown.Header className="text-uppercase">Switch Dashboard</Dropdown.Header>
        <Dropdown.Item href={`${LMS_BASE_URL}/dashboard`}>Personal</Dropdown.Item>
        {/* TODO: support multiple enterprises! */}
        <Dropdown.Item
          as={NavLink}
          to={enterpriseDashboardLink}
          style={{
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          {enterpriseConfig.name}
        </Dropdown.Item>
        <Dropdown.Divider className="border-light" />
        <Dropdown.Item href={`${LMS_BASE_URL}/u/${authenticatedUser.username}`}>My profile</Dropdown.Item>
        <Dropdown.Item href={`${LMS_BASE_URL}/account/settings`}>Account settings</Dropdown.Item>
        <Dropdown.Item href={LEARNER_SUPPORT_URL}>Help</Dropdown.Item>
        <Dropdown.Divider className="border-light" />
        <Dropdown.Item href={logoutUrl}>Sign out</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

AvatarDropdown.propTypes = {
  showLabel: PropTypes.bool,
};

AvatarDropdown.defaultProps = {
  showLabel: true,
};

export default AvatarDropdown;
