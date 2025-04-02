import { useCallback } from 'react';

export const useRenderContactHelpText = (enterpriseCustomer) => {
  const renderContactHelpText = useCallback(
    (LinkComponent = 'a') => {
      const message = 'reach out to your organization\'s edX administrator';

      if (!enterpriseCustomer.contactEmail) {
        return message;
      }
      return (
        <LinkComponent href={`mailto:${enterpriseCustomer.contactEmail}`}>
          {message}
        </LinkComponent>
      );
    },
    [enterpriseCustomer.contactEmail],
  );

  return renderContactHelpText;
};
