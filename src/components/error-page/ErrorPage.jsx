import PropTypes from 'prop-types';
import { Col } from '@openedx/paragon';
import { Helmet } from 'react-helmet';

import FooterSlot from '@openedx/frontend-slot-footer';
import ErrorPageHeader from './ErrorPageHeader';
import ErrorPageTitle from './ErrorPageTitle';
import ErrorPageSubtitle from './ErrorPageSubtitle';
import ErrorPageContent from './ErrorPageContent';

/**
 * React component for the error case when attempting to link a user to a customer. Renders
 * a header, error alert, and a footer.
 */
const ErrorPage = ({
  title,
  titleClassName,
  spannedTitle,
  subtitle,
  showSiteHeader,
  showSiteFooter,
  children,
  errorPageContentClassName,
  testId,
  includeHelmet,
  imageSrc,
}) => (
  <>
    {includeHelmet && <Helmet title="Error | edX" />}
    {showSiteHeader && <ErrorPageHeader />}
    <main id="content" className="fill-vertical-space" data-testid={testId}>
      <ErrorPageContent className={errorPageContentClassName}>
        <Col xs={12} lg={{ span: 10, offset: 1 }}>
          {imageSrc && (
            <img
              src={imageSrc}
              alt="" // image is decorative only; not pertinent to screen readers.
              className="mb-4.5"
            />
          )}
          {title && (
            <ErrorPageTitle
              className={titleClassName}
              spannedTitle={spannedTitle}
            >
              {title}
            </ErrorPageTitle>
          )}
          {subtitle && (
            <ErrorPageSubtitle>{subtitle}</ErrorPageSubtitle>
          )}
          {children}
        </Col>
      </ErrorPageContent>
    </main>
    {showSiteFooter && <FooterSlot />}
  </>
);

ErrorPage.Content = ErrorPageContent;
ErrorPage.Title = ErrorPageTitle;
ErrorPage.Subtitle = ErrorPageSubtitle;

ErrorPage.propTypes = {
  showSiteHeader: PropTypes.bool,
  children: PropTypes.node.isRequired,
  title: PropTypes.node,
  spannedTitle: PropTypes.node,
  titleClassName: PropTypes.string,
  subtitle: PropTypes.node,
  showSiteFooter: PropTypes.bool,
  errorPageContentClassName: PropTypes.string,
  testId: PropTypes.string,
  includeHelmet: PropTypes.bool,
  imageSrc: PropTypes.string,
};

ErrorPage.defaultProps = {
  title: 'Error occurred while processing your request',
  spannedTitle: null,
  titleClassName: undefined,
  subtitle: null,
  showSiteHeader: true,
  showSiteFooter: true,
  errorPageContentClassName: undefined,
  testId: undefined,
  includeHelmet: false,
  imageSrc: undefined,
};

export default ErrorPage;
