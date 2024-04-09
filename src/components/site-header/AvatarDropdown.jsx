import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { NavLink, generatePath, useLocation } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform/config';
import { AppContext } from '@edx/frontend-platform/react';
import { AvatarButton, Dropdown } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { isDefinedAndNotNull } from '../../utils/common';
import { useEnterpriseLearner } from '../app/data';

const AvatarDropdown = ({ showLabel }) => {
  const {
    BASE_URL,
    LMS_BASE_URL,
    LOGOUT_URL,
    LEARNER_SUPPORT_URL,
  } = getConfig();
  const {
    authenticatedUser: { username, profileImage },
  } = useContext(AppContext);
  const {
    data: {
      enterpriseCustomer,
      allLinkedEnterpriseCustomerUsers,
    },
  } = useEnterpriseLearner();
  const enterpriseDashboardLink = `/${enterpriseCustomer.slug}`;
  const intl = useIntl();
  const location = useLocation();

  const idpPresent = isDefinedAndNotNull(enterpriseCustomer.identityProvider);
  // we insert the logout=true in this case to avoid the redirect back to IDP
  // which brings the user right back in, disallowing a proper logout
  const logoutHint = idpPresent ? `${encodeURIComponent('?')}logout=true` : '';
  const nextUrl = `${BASE_URL}${enterpriseDashboardLink}${logoutHint}`;
  const logoutUrl = `${LOGOUT_URL}?next=${nextUrl}`;
  return (
    <Dropdown>
      <Dropdown.Toggle
        showLabel={showLabel}
        as={AvatarButton}
        src={profileImage.imageUrlMedium}
        id="site-header-avatar-dropdown-toggle"
      >
        {username}
      </Dropdown.Toggle>
      <Dropdown.Menu
        style={{ maxWidth: 280 }}
        alignRight
      >
        <Dropdown.Header className="text-uppercase">
          {intl.formatMessage({
            id: 'site.header.avatar.dropdown.switch.dashboard.title',
            defaultMessage: 'Switch Dashboard',
            description: 'Switch dashboard section title in avatar dropdown.',
          })}
        </Dropdown.Header>
        <Dropdown.Item href={`${LMS_BASE_URL}/dashboard`}>
          {intl.formatMessage({
            id: 'site.header.avatar.dropdown.personal.dashboard.title',
            defaultMessage: 'Personal',
            description: 'Personal dashboard link title in avatar dropdown.',
          })}
        </Dropdown.Item>
        {allLinkedEnterpriseCustomerUsers
          .sort((a, b) => {
            const nameA = a.enterpriseCustomer?.name || ''; // Fallback to empty string if enterpriseCustomer or its name is undefined
            const nameB = b.enterpriseCustomer?.name || ''; // Fallback to empty string if enterpriseCustomer or its name is undefined
            return nameA.localeCompare(nameB);
          })
          .map((enterpriseCustomerUser) => (
            <Dropdown.Item
              key={enterpriseCustomerUser.enterpriseCustomer.slug}
              as={NavLink}
              to={generatePath('/:enterpriseSlug/*', {
                enterpriseSlug: enterpriseCustomerUser.enterpriseCustomer.slug,
                '*': location.pathname.split('/').filter(pathPart => !!pathPart).slice(1).join('/'),
              })}
              className="text-wrap"
            >
              {enterpriseCustomerUser.enterpriseCustomer.name}
            </Dropdown.Item>
          ))}
        <Dropdown.Divider className="border-light" />
        <Dropdown.Item href={`${LMS_BASE_URL}/u/${username}`}>
          {intl.formatMessage({
            id: 'site.header.avatar.dropdown.my.profile.title',
            defaultMessage: 'My profile',
            description: 'My profile link title in avatar dropdown.',
          })}
        </Dropdown.Item>
        <Dropdown.Item href={`${LMS_BASE_URL}/account/settings`}>
          {intl.formatMessage({
            id: 'site.header.avatar.dropdown.account.settings.title',
            defaultMessage: 'Account settings',
            description: 'Account settings link title in avatar dropdown.',
          })}
        </Dropdown.Item>
        <Dropdown.Item href={LEARNER_SUPPORT_URL}>
          {intl.formatMessage({
            id: 'site.header.avatar.dropdown.help.title',
            defaultMessage: 'Help',
            description: 'Help link title in avatar dropdown.',
          })}
        </Dropdown.Item>
        <Dropdown.Divider className="border-light" />
        <Dropdown.Item href={logoutUrl}>{intl.formatMessage({
          id: 'site.header.avatar.dropdown.sign.out.title',
          defaultMessage: 'Sign out',
          description: 'Sign out link title in avatar dropdown.',
        })}
        </Dropdown.Item>
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
