import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen, render } from '@testing-library/react';

import EnterpriseOffersSummaryCard from '../EnterpriseOffersSummaryCard';
import { ENTERPRISE_OFFER_SUMMARY_CARD_TITLE } from '../data/constants';

const mockEnterpriseOffer = {
  isCurrent: true,
  uuid: 'test-enterprise-offer-uuid',
  status: 'Open',
  enterpriseCatalogUuid: 'test-enterprise-catalog-uuid',
  startDatetime: '2022-06-01T00:00:00Z',
  endDatetime: '2023-06-01T00:00:00Z',
  maxDiscount: 5000,
  remainingBalance: 4500,
  remainingBalanceForUser: null,
};

describe('<EnterpriseOffersSummaryCard />', () => {
  it('should render searchCoursesCta', () => {
    const cta = 'Search Courses';
    render(
      <EnterpriseOffersSummaryCard
        offers={[mockEnterpriseOffer]}
        searchCoursesCta={
          <button type="button">{cta}</button>
        }
      />,
    );

    expect(screen.getByText(ENTERPRISE_OFFER_SUMMARY_CARD_TITLE)).toBeInTheDocument();
    expect(screen.getByText(cta)).toBeInTheDocument();
  });

  it('should render default summary text if remainingBalanceForUser is null', () => {
    render(
      <EnterpriseOffersSummaryCard
        offers={[mockEnterpriseOffer]}
      />,
    );

    expect(screen.getByTestId('offer-summary-text')).toBeInTheDocument();
  });

  it('should render earliest, current offer end date, if applicable', () => {
    render(
      <EnterpriseOffersSummaryCard
        offers={[
          {
            ...mockEnterpriseOffer,
            isCurrent: false,
            endDatetime: '2022-04-01T00:00:00Z', // earliest, non-current start date
          },
          {
            ...mockEnterpriseOffer,
            endDatetime: '2023-12-01T00:00:00Z', // earliest, current start date
          },
        ]}
      />,
    );
    expect(screen.getByTestId('offer-summary-end-date-text')).toBeInTheDocument();
    expect(screen.getByText('Nov 30, 2023')).toBeInTheDocument();
  });
});
