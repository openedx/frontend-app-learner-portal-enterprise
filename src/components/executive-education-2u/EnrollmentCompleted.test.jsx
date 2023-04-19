import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import ExecutiveEducation2UEnrollmentCompleted from './EnrollmentCompleted';
import { CURRENCY_USD } from '../course/data/constants';

const enterpriseSlug = 'test-enterprise-slug';
const initialAppContextValue = {
  enterpriseConfig: {
    name: 'Test Enterprise',
    slug: enterpriseSlug,
  },
};
let metaData = {
  state: {
    data: {
      organizationImage: 'test-image',
      organizationName: 'test org',
      title: 'test-title',
      startDate: '2022-09-09',
      duration: '8',
      priceDetails: {
        price: 90,
        currency: CURRENCY_USD,
      },

    },
  },
};

const ExecutiveEducation2UEnrollmentCompletedPage = ({
  appContextValue = initialAppContextValue, location,
}) => (
  <AppContext.Provider value={appContextValue}>
    <ExecutiveEducation2UEnrollmentCompleted location={location} />
  </AppContext.Provider>
);

describe('ExecutiveEducation2UEnrollmentCompleted', () => {
  it('renders enrollment completed page with the metadata', () => {
    renderWithRouter(<ExecutiveEducation2UEnrollmentCompletedPage location={metaData} />);
    expect(screen.getByText('What happens next?')).toBeInTheDocument();
    expect(screen.getByText('test org')).toBeInTheDocument();
    expect(screen.getByText(8)).toBeInTheDocument();
  });

  it('renders enrollment completed page and check for changed course summary start date label', () => {
    renderWithRouter(<ExecutiveEducation2UEnrollmentCompletedPage location={metaData} />);
    expect(screen.getByText('Start date:')).toBeInTheDocument();
  });

  it('renders enrollment completed page with out title in content metadata', () => {
    metaData = {
      state: {
        data: {
          organizationImage: 'test-image',
          organizationName: 'test org',
        },
      },
    };
    renderWithRouter(<ExecutiveEducation2UEnrollmentCompletedPage location={metaData} />);
    expect(screen.queryByText('test-title')).not.toBeInTheDocument();
  });
});
