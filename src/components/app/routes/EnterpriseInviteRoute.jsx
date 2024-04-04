import { Button, Hyperlink } from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform';

import { ErrorPage } from '../../error-page';

export { makeEnterpriseInviteLoader } from './loaders';

/**
 * The UI associated with the enterprise invite route. It should only render
 * if the API call to link the user to the enterprise customer fails, which
 * occurs within the associated route loader.
 *
 * @returns {JSX.Element} - The EnterpriseInviteRoute component.
 */
const EnterpriseInviteRoute = () => (
  <ErrorPage
    subtitle="We couldn't link your edX account to your organization"
    errorPageContentClassName="py-4.5"
    testId="enterprise-invite-error"
  >
    <p className="mb-5">
      Please reach out to your edX administrator or visit the{' '}
      <Hyperlink
        destination={getConfig().LEARNER_SUPPORT_URL}
        target="_blank"
      >
        edX Help Center
      </Hyperlink>{' '}
      to resolve the error and gain access to subsidized content, or continue to{' '}
      <Hyperlink
        destination={getConfig().MARKETING_SITE_BASE_URL}
        target="_blank"
      >
        edX.org
      </Hyperlink>{' '}
      to start learning on your own.
    </p>
    <Button
      as={Hyperlink}
      target="_blank"
      destination={getConfig().MARKETING_SITE_BASE_URL}
      variant="primary"
      size="sm"
    >
      Continue to edX.org
    </Button>
  </ErrorPage>
);

export default EnterpriseInviteRoute;
