import React, { useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';

import './styles/EnterpriseBanner.scss';

export default function EnterpriseBanner() {
  const { enterpriseConfig } = useContext(AppContext);
  return (
    <div className="enterprise-banner bg-brand-secondary">
      <div className="container-fluid">
        <h1 className="h2 mb-0 py-3 pl-3 border-brand-tertiary text-brand-secondary">
          {enterpriseConfig.name}
        </h1>
      </div>
    </div>
  );
}
