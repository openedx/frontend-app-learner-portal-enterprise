import { renderHook } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';

import { authenticatedUserFactory } from '../../../../app/data/services/data/__factories__';
import { useCourseMetadata, useCourseRedemptionEligibility } from '../../../../app/data';
import { getCoursePrice } from '../../utils';
import useCourseListPrice from '../useCourseListPrice';

jest.mock('../../../../app/data', () => ({
  ...jest.requireActual('../../../../app/data'),
  useCourseMetadata: jest.fn(),
  useCourseRedemptionEligibility: jest.fn(),
}));

const mockOrgName = 'Fake Org Name';
const mockLogoImageUrl = 'https://fake-logo.url';
const mockOrgMarketingUrl = 'https://fake-mktg.url';
const mockWeeksToComplete = 8;
const mockListPrice = 100;
const mockCurrency = 'USD';
const mockCourseTitle = 'Test Course Title';
const mockCourseRunStartDate = '2023-04-20T12:00:00Z';

const baseCourseMetadataValue = {
  organization: {
    name: mockOrgName,
    logoImgUrl: mockLogoImageUrl,
    marketingUrl: mockOrgMarketingUrl,
  },
  title: mockCourseTitle,
  startDate: mockCourseRunStartDate,
  duration: `${mockWeeksToComplete} Weeks`,
  priceDetails: {
    price: mockListPrice,
    currency: mockCurrency,
  },
  activeCourseRun: {
    firstEnrollablePaidSeatPrice: 25,
    fixedPriceUsd: 35,
  },
  entitlements: [
    {
      price: 15,
    },
  ],
};
const mockedListPrice = [mockListPrice];

const mockAuthenticatedUser = authenticatedUserFactory();

const Wrapper = ({ children }) => (
  <AppContext.Provider value={mockAuthenticatedUser}>
    {children}
  </AppContext.Provider>
);

describe('useCourseListPrice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCourseRedemptionEligibility.mockReturnValue({ data: { listPrice: mockedListPrice } });
    // NOTE: `useCourseMetadata`'s mocked return value assumes the returned value
    // from the `select` function passed to the hook.
    useCourseMetadata.mockReturnValue({
      data: mockedListPrice.length > 0 ? mockedListPrice : getCoursePrice(baseCourseMetadataValue),
    });
  });

  it('should return the list price if one exist', () => {
    const { result } = renderHook(
      () => useCourseListPrice(),
      { wrapper: Wrapper },
    );
    const expectedListPrice = [mockListPrice];
    const courseMetadataSelectFn = useCourseMetadata.mock.calls[0][0].select;
    expect(expectedListPrice).toEqual(courseMetadataSelectFn({ transformed: baseCourseMetadataValue }));
    expect(result.current).toEqual({ data: expectedListPrice });
  });

  it('should not return the list price if one doesnt exist, fall back to fixed_price_usd from getCoursePrice', () => {
    const updatedListPrice = [];
    useCourseRedemptionEligibility.mockReturnValue({ data: { listPrice: updatedListPrice } });
    useCourseMetadata.mockReturnValue(
      { data: updatedListPrice.length > 0 ? updatedListPrice : getCoursePrice(baseCourseMetadataValue) },
    );
    const { result } = renderHook(
      () => useCourseListPrice(),
      { wrapper: Wrapper },
    );
    const expectedListPrice = [baseCourseMetadataValue.activeCourseRun.fixedPriceUsd];
    const courseMetadataSelectFn = useCourseMetadata.mock.calls[0][0].select;
    expect(expectedListPrice).toEqual(courseMetadataSelectFn({ transformed: baseCourseMetadataValue }));
    expect(result.current).toEqual({ data: expectedListPrice });
  });

  it('should not return the list price if one doesnt exist, fall back to firstEnrollablePaidSeatPrice from getCoursePrice', () => {
    const updatedListPrice = [];
    useCourseRedemptionEligibility.mockReturnValue({ data: { listPrice: updatedListPrice } });
    delete baseCourseMetadataValue.activeCourseRun.fixedPriceUsd;
    useCourseMetadata.mockReturnValue(
      { data: updatedListPrice.length > 0 ? updatedListPrice : getCoursePrice(baseCourseMetadataValue) },
    );
    const { result } = renderHook(
      () => useCourseListPrice(),
      { wrapper: Wrapper },
    );
    const expectedListPrice = [baseCourseMetadataValue.activeCourseRun.firstEnrollablePaidSeatPrice];
    const courseMetadataSelectFn = useCourseMetadata.mock.calls[0][0].select;
    expect(expectedListPrice).toEqual(courseMetadataSelectFn({ transformed: baseCourseMetadataValue }));
    expect(result.current).toEqual({ data: expectedListPrice });
  });

  it('should not return the list price if one doesnt exit, fall back to entitlements from getCoursePrice', () => {
    const updatedListPrice = [];
    useCourseRedemptionEligibility.mockReturnValue({ data: { listPrice: updatedListPrice } });
    delete baseCourseMetadataValue.activeCourseRun.fixedPriceUsd;
    delete baseCourseMetadataValue.activeCourseRun.firstEnrollablePaidSeatPrice;
    useCourseMetadata.mockReturnValue(
      { data: updatedListPrice > 0 ? updatedListPrice : getCoursePrice(baseCourseMetadataValue) },
    );
    const { result } = renderHook(
      () => useCourseListPrice(),
      { wrapper: Wrapper },
    );
    const expectedListPrice = [baseCourseMetadataValue.entitlements[0].price];
    const courseMetadataSelectFn = useCourseMetadata.mock.calls[0][0].select;
    expect(expectedListPrice).toEqual(courseMetadataSelectFn({ transformed: baseCourseMetadataValue }));
    expect(result.current).toEqual({ data: expectedListPrice });
  });

  it('should not return the list price if one doesnt exist or the course metadata doesnt include it', () => {
    const updatedListPrice = [];
    useCourseRedemptionEligibility.mockReturnValue({ data: { listPrice: updatedListPrice } });
    const updatedCourseMetadata = {
      ...baseCourseMetadataValue,
      activeCourseRun: {
        ...baseCourseMetadataValue.activeCourseRun,
        fixedPriceUsd: null,
        firstEnrollablePaidSeatPrice: null,
      },
      entitlements: [],
    };
    useCourseMetadata.mockReturnValue(
      { data: updatedListPrice.length > 0 ? updatedListPrice : getCoursePrice(updatedCourseMetadata) },
    );
    const { result } = renderHook(
      () => useCourseListPrice(),
      { wrapper: Wrapper },
    );
    const expectedListPrice = null;
    const courseMetadataSelectFn = useCourseMetadata.mock.calls[0][0].select;
    expect(expectedListPrice).toEqual(courseMetadataSelectFn({ transformed: updatedCourseMetadata }));
    expect(result.current).toEqual({ data: expectedListPrice });
  });
});
