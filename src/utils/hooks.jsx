import React, { useCallback } from 'react';

export function useRenderContactHelpText(enterpriseConfig) {
  const renderContactHelpText = useCallback(
    () => {
      const { contactEmail } = enterpriseConfig;
      const message = 'reach out to your organization\'s edX administrator';

      if (!contactEmail) {
        return message;
      }
      return (
        <a href={`mailto:${contactEmail}`}>
          {message}
        </a>
      );
    },
    [enterpriseConfig],
  );

  return renderContactHelpText;
}
