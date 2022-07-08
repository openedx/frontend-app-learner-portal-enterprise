import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen, render } from '@testing-library/react';
import moment from 'moment';
import EnterpriseOffersSummaryCard from '../EnterpriseOffersSummaryCard';
import { ENTERPRISE_OFFER_SUMMARY_CARD_TITLE } from '../data/constants';

describe('<EnterpriseOffersSummaryCard />', () => {
  it('should render searchCoursesCta', () => {
    const cta = 'Search Courses';
    render(
      <EnterpriseOffersSummaryCard
        offer={{}}
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
        offer={{}}
      />,
    );

    expect(screen.getByTestId('offer-summary-text')).toBeInTheDocument();
  });

  it('should render detailed summary text if remainingBalanceForUser is not null', () => {
    const offer = {
      remainingBalanceForUser: 100,
    };
    render(
      <EnterpriseOffersSummaryCard
        offer={offer}
      />,
    );
    expect(screen.getByTestId('offer-summary-text-detailed')).toBeInTheDocument();
  });

  it('should render offer end date if applicable', () => {
    const now = moment().toISOString();
    const offer = {
      endDatetime: now,
    };
    render(
      <EnterpriseOffersSummaryCard
        offer={offer}
      />,
    );

    expect(screen.getByTestId('offer-summary-end-date-text')).toBeInTheDocument();
  });
});
