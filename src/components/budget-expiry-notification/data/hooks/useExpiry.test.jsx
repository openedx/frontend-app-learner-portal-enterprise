import { renderHook } from '@testing-library/react-hooks';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration'; // Assuming this is the path to your expiryThresholds file
import useExpiry from './useExpiry';
import useExpirationMetadata from './useExpirationMetadata';
import {
  PLAN_EXPIRY_VARIANTS,
  SEEN_ENTERPRISE_EXPIRATION_ALERT_COOKIE_PREFIX,
  SEEN_ENTERPRISE_EXPIRATION_MODAL_COOKIE_PREFIX,
} from '../constants';
import { useEnterpriseCustomer } from '../../../app/data';
import { enterpriseCustomerFactory } from '../../../app/data/services/data/__factories__';

dayjs.extend(duration);

const modalOpen = jest.fn();
const modalClose = jest.fn();
const alertOpen = jest.fn();
const alertClose = jest.fn();
const mockEnterpriseCustomer = enterpriseCustomerFactory();

jest.mock('./useExpirationMetadata', () => jest.fn());
jest.mock('../../../app/data', () => ({
  ...jest.requireActual('../../../app/data'),
  useEnterpriseCustomer: jest.fn(),
}));

const enterpriseUUID = 'fake-id';

const mock30Threshold = {
  alertTemplate: {
    title: '30 alert threshold title',
    variant: 'info',
    message: '30 alert threshold message',
    dismissible: true,
  },
  modalTemplate: {
    title: '30 modal threshold title',
    message: '30 modal threshold message',
  },
  variant: PLAN_EXPIRY_VARIANTS.expiring,
};

const mock60Threshold = {
  alertTemplate: {
    title: '60 alert threshold title',
    variant: 'info',
    message: '60 alert threshold message',
    dismissible: true,
  },
  modalTemplate: {
    title: '60 modal threshold title',
    message: '60 modal threshold message',
  },
  variant: PLAN_EXPIRY_VARIANTS.expiring,
};

describe('useExpiry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useExpirationMetadata.mockReturnValue({
      thresholdKey: null,
      threshold: null,
      isPlanApproachingExpiry: false,
    });
  });

  it.each([
    {
      thresholdKey: 60,
      mock: mock60Threshold,
      endDate: dayjs().add(60, 'day'),
    },
    {
      thresholdKey: 30,
      endDate: dayjs().add(30, 'day'),
      mock: mock30Threshold,
    },
  ])('displays correct alert and modal when plan is expiring in %s days', ({ thresholdKey, mock, endDate }) => {
    useExpirationMetadata.mockReturnValue({
      thresholdKey,
      threshold: mock,
      isPlanApproachingExpiry: false,
    });

    const budget = { end: endDate, isNonExpiredBudget: true }; // Mock data with an expiring budget
    const { result } = renderHook(() => (
      useExpiry(enterpriseUUID, budget, modalOpen, modalClose, alertOpen, alertClose)
    ));

    expect(result.current.alert).toEqual(mock.alertTemplate);
    expect(result.current.modal).toEqual(mock.modalTemplate);
    expect(result.current.dismissAlert).toEqual(expect.any(Function));
    expect(result.current.dismissModal).toEqual(expect.any(Function));

    result.current.dismissAlert();
    result.current.dismissModal();

    expect(alertClose).toHaveBeenCalledTimes(1);
    expect(modalClose).toHaveBeenCalledTimes(1);

    const alertLocalstorage = global.localStorage.getItem(`${SEEN_ENTERPRISE_EXPIRATION_ALERT_COOKIE_PREFIX}${thresholdKey}-${enterpriseUUID}`);
    const modalLocalstorage = global.localStorage.getItem(`${SEEN_ENTERPRISE_EXPIRATION_MODAL_COOKIE_PREFIX}${thresholdKey}-${enterpriseUUID}`);

    expect(alertLocalstorage).toBeTruthy();
    expect(modalLocalstorage).toBeTruthy();
  });

  it.each([
    {
      thresholdKey: 60,
      mock: mock60Threshold,
      endDate: dayjs().add(60, 'day'),
    },
    {
      thresholdKey: 30,
      endDate: dayjs().add(30, 'day'),
      mock: mock30Threshold,
    },
  ])('displays no alert or modal when plan is expiring in %s days and disableExpiryMessagingForLearnerCredit is false', ({ thresholdKey, mock, endDate }) => {
    useExpirationMetadata.mockReturnValue({
      thresholdKey,
      threshold: mock,
      isPlanApproachingExpiry: false,
    });
    useEnterpriseCustomer.mockReturnValue({
      data: {
        ...mockEnterpriseCustomer,
        disableExpiryMessagingForLearnerCredit: true,
      },
    });

    const budget = { end: endDate, isNonExpiredBudget: true }; // Mock data with an expiring budget
    const { result } = renderHook(() => (
      useExpiry(enterpriseUUID, budget, modalOpen, modalClose, alertOpen, alertClose)
    ));

    expect(result.current.alert).toEqual(null);
    expect(result.current.modal).toEqual(null);
  });
});
