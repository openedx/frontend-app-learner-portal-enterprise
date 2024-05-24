import { Link } from 'react-router-dom';
import { Button } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import React from 'react';
import useEnterpriseCustomer from '../app/data/hooks/useEnterpriseCustomer';
import { useAcademies } from '../app/data';

const GoToAcademy = () => {
  const { data: academies } = useAcademies();
  const { data: enterpriseCustomer } = useEnterpriseCustomer();

  return (
    <>
      <p>
        <FormattedMessage
          id="enterprise.dashboard.tab.courses.go.to.academy.message"
          defaultMessage="Getting started with edX is easy. Simply find a course from your Academy, request enrollment, and get started on your learning journey."
          description="Default message shown to a learner on enterprise dashboard."
        />
      </p>
      <Button
        as={Link}
        to={`/${enterpriseCustomer.slug}/academies/${academies[0].uuid}`}
        className="btn-brand-primary d-block d-md-inline-block"
      >
        <FormattedMessage
          id="enterprise.dashboard.tab.courses.go.to.academy"
          defaultMessage="Go to Academy"
          description="Label to go to academy button on enterprise dashboard."
        />
      </Button>
    </>
  );
};

export default GoToAcademy;
