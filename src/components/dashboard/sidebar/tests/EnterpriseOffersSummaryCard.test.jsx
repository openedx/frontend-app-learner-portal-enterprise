import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen, render } from '@testing-library/react';
import EnterpriseOffersSummaryCard from '../EnterpriseOffersSummaryCard';
import { ENTERPRISE_OFFER_SUMMARY_CARD_TITLE } from '../data/constants';

describe('<EnterpriseOffersSummaryCard />', () => {
  it('should render searchCoursesCta', () => {
    const cta = 'Search Courses';
    render(
      <EnterpriseOffersSummaryCard
        searchCoursesCta={
          <button type="button">{cta}</button>
        }
      />,
    );

    expect(screen.getByText(ENTERPRISE_OFFER_SUMMARY_CARD_TITLE)).toBeInTheDocument();
    expect(screen.getByText(cta)).toBeInTheDocument();
  });
});
