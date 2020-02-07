import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';
import { IntlProvider } from 'react-intl';
import SiteHeader from '@edx/frontend-component-site-header';
import SiteFooter from '@edx/frontend-component-footer';
import { AppContext } from '@edx/frontend-platform/react';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import {
  faFacebookSquare,
  faTwitterSquare,
  faLinkedin,
  faRedditSquare,
} from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


import EdXLogo from '../../assets/edx-logo.svg';

import './styles/Layout.scss';

class Layout extends Component {
  getUserMenuItems = () => {
    const { header: { userMenu } } = this.context;
    return userMenu || [];
  };

  getMainMenuItems = () => {
    const { header: { mainMenu } } = this.context;
    return mainMenu || [];
  };

  render() {
    const {
      siteUrl, siteName, children, headerLogo, footerLogo,
    } = this.props;

    const user = getAuthenticatedUser();
    const { username, profileImage } = user;

    return (
      <IntlProvider locale="en">
        <>
          <Helmet titleTemplate="%s - edX" defaultTitle="edX">
            <html lang="en" />
          </Helmet>
          <SiteHeader
            logo={headerLogo || EdXLogo}
            logoDestination={siteUrl}
            logoAltText={siteName}
            loggedIn={!!username}
            username={username}
            avatar={profileImage.imageUrlMedium}
            mainMenu={this.getMainMenuItems()}
            userMenu={this.getUserMenuItems()}
            loggedOutItems={[
              { type: 'item', href: '#', content: 'Login' },
              { type: 'item', href: '#', content: 'Sign Up' },
            ]}
            skipNavId="content"
          />
          <main id="content">
            {children}
          </main>
          {/* TODO: Fix footer */}
          <SiteFooter
            siteLogo={{
              src: footerLogo || EdXLogo,
              altText: siteName,
              ariaLabel: siteName,
            }}
            ariaLabel="Page Footer"
            marketingSiteBaseUrl="https://www.edx.org"
            appleAppStore={{
              url: 'https://apps.apple.com/us/app/edx/id945480667',
              altText: 'Download the edX mobile app from the Apple App Store',
            }}
            googlePlay={{
              url: 'https://play.google.com/store/apps/details?id=org.edx.mobile',
              altText: 'Download the edX mobile app from Google Play',
            }}
            handleAllTrackEvents={() => {}}
            linkSectionOne={{
              title: 'edX',
              linkList: [
                { title: 'About', url: 'https://www.edx.org/about-us' },
                { title: 'edX for Business', url: 'https://business.edx.org/?utm_campaign=edX.org+Referral&utm_medium=Footer&utm_source=edX.org' },
                { title: 'Affiliates', url: 'https://www.edx.org/affiliate-program' },
                { title: 'Open edX', url: 'http://open.edx.org/' },
                { title: 'Careers', url: 'https://www.edx.org/careers' },
                { title: 'News', url: 'https://www.edx.org/news-announcements' },
              ],
            }}
            linkSectionTwo={{
              title: 'Legal',
              linkList: [
                { title: 'Terms of Service & Honor Code', url: 'https://www.edx.org/edx-terms-service' },
                { title: 'Privacy Policy', url: 'https://www.edx.org/edx-privacy-policy' },
                { title: 'Accessibility Policy', url: 'https://www.edx.org/accessibility' },
                { title: 'Trademark Policy', url: 'https://www.edx.org/trademarks' },
                { title: 'Sitemap', url: 'https://www.edx.org/sitemap' },
              ],
            }}
            linkSectionThree={{
              title: 'Connect',
              linkList: [
                { title: 'Blog', url: 'https://www.edx.org/blog' },
                { title: 'Contact Us', url: 'https://courses.edx.org/support/contact_us' },
                { title: 'Help Center', url: 'https://support.edx.org/hc/en-us' },
                { title: 'Media Kit', url: 'https://www.edx.org/media-kit' },
                { title: 'Donate', url: 'https://www.edx.org/donate' },
              ],
            }}
            socialLinks={[
              {
                title: 'Facebook',
                url: 'https://www.facebook.com/edX',
                icon: <FontAwesomeIcon icon={faFacebookSquare} className="social-icon" size="2x" />,
                screenReaderText: 'Like edX on Facebook',
              },
              {
                title: 'Twitter',
                url: 'https://twitter.com/edXOnline',
                icon: <FontAwesomeIcon icon={faTwitterSquare} className="social-icon" size="2x" />,
                screenReaderText: 'Follow edX on Twitter',
              },
              {
                title: 'LinkedIn',
                url: 'http://www.linkedin.com/company/edx',
                icon: <FontAwesomeIcon icon={faLinkedin} className="social-icon" size="2x" />,
                screenReaderText: 'Follow edX on LinkedIn',
              },
              {
                title: 'Reddit',
                url: 'https://www.reddit.com/r/edX/',
                icon: <FontAwesomeIcon icon={faRedditSquare} className="social-icon" size="2x" />,
                screenReaderText: 'Subscribe to the edX subreddit',
              },
            ]}
            copyright="© 2012–2019 edX Inc."
            trademark={(
              <>
                EdX, Open edX, and MicroMasters are registered trademarks of edX Inc. | 深圳市恒宇博科技有限公司 <a href="http://www.beian.miit.gov.cn">粤ICP备17044299号-2</a>
              </>
            )}
          />
        </>
      </IntlProvider>
    );
  }
}

Layout.contextType = AppContext;

Layout.defaultProps = {
  children: [],
  siteName: 'edX',
  siteUrl: 'https://edx.org/',
  headerLogo: null,
  footerLogo: null,
};

Layout.propTypes = {
  children: PropTypes.node,
  siteName: PropTypes.string,
  siteUrl: PropTypes.string,
  headerLogo: PropTypes.string,
  footerLogo: PropTypes.string,
};

export default Layout;
