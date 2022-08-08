/* eslint-disable react/no-danger */
import React, {
  useContext, useEffect, useMemo, useState,
} from 'react';
import { Container, Tabs, Tab } from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { Helmet } from 'react-helmet';
import Skeleton from 'react-loading-skeleton';
import { logError } from '@edx/frontend-platform/logging';

import NotFoundPage from '../NotFoundPage';
import { getExecutiveEducation2UTerms } from './data';

function ExecutiveEducation2UPage() {
  const { enterpriseConfig } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(true);
  const [terms, setTerms] = useState();

  useEffect(() => {
    const fetchTerms = async () => {
      setIsLoading(true);
      try {
        const response = await getExecutiveEducation2UTerms();
        setTerms(camelCaseObject(response.data));
      } catch (error) {
        logError(error);
      } finally {
        setIsLoading(false);
      }
    };
    if (enterpriseConfig.enableExecutiveEducation2UFulfillment) {
      fetchTerms();
    }
  }, [enterpriseConfig.enableExecutiveEducation2UFulfillment]);

  const tabs = useMemo(() => {
    if (!terms) {
      return [];
    }
    const includedTabs = [];
    if (terms.studentTermsAndConditions) {
      const key = 'studentTermsAndConditions';
      includedTabs.push(
        <Tab eventKey={key} key={key} title="Student Terms and Conditions" className="py-4">
          <div dangerouslySetInnerHTML={{ __html: terms.studentTermsAndConditions }} />
        </Tab>,
      );
    }
    if (terms.websiteTermsOfUse) {
      const key = 'websiteTermsOfUse';
      includedTabs.push(
        <Tab eventKey={key} key={key} title="Website Terms of Use" className="py-4">
          <div dangerouslySetInnerHTML={{ __html: terms.websiteTermsOfUse }} />
        </Tab>,
      );
    }
    if (terms.privacyPolicy) {
      const key = 'privacyPolicy';
      includedTabs.push(
        <Tab eventKey={key} key={key} title="Privacy Policy" className="py-4">
          <div dangerouslySetInnerHTML={{ __html: terms.privacyPolicy }} />
        </Tab>,
      );
    }
    if (terms.cookiePolicy) {
      const key = 'cookiePolicy';
      includedTabs.push(
        <Tab eventKey={key} key={key} title="Cookie Policy" className="py-4">
          <div dangerouslySetInnerHTML={{ __html: terms.cookiePolicy }} />
        </Tab>,
      );
    }
    return includedTabs;
  }, [terms]);

  if (!enterpriseConfig.enableExecutiveEducation2UFulfillment) {
    return (
      <NotFoundPage />
    );
  }

  return (
    <Container size="lg" className="py-5">
      <Helmet>
        <title>Executive Education (2U)</title>
      </Helmet>
      {isLoading && (
        <p data-testid="loading-skeleton-geag-terms"><Skeleton count={20} /></p>
      )}
      {tabs.length > 0 && (
        <Tabs defaultActiveKey="studentTermsAndConditions" id="geag-terms">
          {tabs}
        </Tabs>
      )}
    </Container>
  );
}

export default ExecutiveEducation2UPage;
