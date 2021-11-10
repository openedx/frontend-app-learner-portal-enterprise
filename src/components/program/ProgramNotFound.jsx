import React, { useContext } from 'react';
import { Helmet } from 'react-helmet';
import { AppContext } from '@edx/frontend-platform/react';
import { Container } from '@edx/paragon';

const ProgramNotFoundPage = () => {
  const { enterpriseConfig } = useContext(AppContext);

  let PAGE_TITLE = 'Program not found';
  if (enterpriseConfig) {
    PAGE_TITLE += ` - ${enterpriseConfig.name}`;
  }

  return (
    <Container size="lg" className="mt-3">
      <Helmet title={PAGE_TITLE} />
      <div className="text-center py-5">
        <h1>Program not found</h1>
        <p className="lead">Oops, sorry This program is not included in your organization&apos;s catalog.</p>
      </div>
    </Container>
  );
};

export default ProgramNotFoundPage;
