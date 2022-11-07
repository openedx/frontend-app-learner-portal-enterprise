import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen, render } from '@testing-library/react';
import EnterpriseOffersSummaryCard from '../EnterpriseOffersSummaryCard';
import { ENTERPRISE_OFFER_SUMMARY_CARD_TITLE } from '../data/constants';

const mockEnterpriseOffer = {
  uuid: 'test-enterprise-offer-uuid',
  status: 'Open',
  enterpriseCatalogUuid: 'test-enterprise-catalog-uuid',
  startDatetime: '2022-06-01T00:00:00Z',
  endDatetime: '2023-06-01T00:00:00Z',
  maxDiscount: 5000,
  remainingBalance: 4500,
  remainingBalanceForUser: null,
};

const mockEnterpriseOfferMaxUserDiscount = {
  ...mockEnterpriseOffer,
  remainingBalanceForUser: 200,
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

  it('should render detailed summary text if remainingBalanceForUser is not null', () => {
    const offers = [
      mockEnterpriseOfferMaxUserDiscount,
      {
        ...mockEnterpriseOfferMaxUserDiscount,
        remainingBalanceForUser: 100,
      },
    ];
    render(
      <EnterpriseOffersSummaryCard
        offers={offers}
      />,
    );
    // calculate sum of balance available for user across all offers
    const expectedMaxUserDiscountSum = offers.reduce((acc, offer) => {
      if (offer.remainingBalanceForUser) {
        return acc + offer.remainingBalanceForUser;
      }
      return acc;
    }, 0);
    expect(screen.getByTestId('offer-summary-text-detailed')).toBeInTheDocument();
    expect(screen.getByText(`$${expectedMaxUserDiscountSum}`)).toBeInTheDocument();
  });

  it('should render earliest offer end date, if applicable', () => {
    render(
      <EnterpriseOffersSummaryCard
        offers={[
          mockEnterpriseOffer,
          {
            ...mockEnterpriseOffer,
            endDatetime: '2023-04-01T00:00:00Z',
          },
        ]}
      />,
    );

    expect(screen.getByTestId('offer-summary-end-date-text')).toBeInTheDocument();
    expect(screen.getByText('Mar 31, 2023')).toBeInTheDocument();
  });
});
