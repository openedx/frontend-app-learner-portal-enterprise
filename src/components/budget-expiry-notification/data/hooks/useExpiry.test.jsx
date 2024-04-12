import { renderHook } from '@testing-library/react-hooks';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration'; // Assuming this is the path to your expiryThresholds file
import useExpiry from './useExpiry';
import expiryThresholds from '../expiryThresholds';

dayjs.extend(duration);

const modalOpen = jest.fn();
const modalClose = jest.fn();
const alertOpen = jest.fn();
const alertClose = jest.fn();

const formatDate = (date) => dayjs(date).format('MMM D, YYYY');

describe('useExpiry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    (() => {
      const endDate = dayjs().add(60, 'day');
      return { endDate, expected: expiryThresholds[60]({ date: formatDate(endDate.toString()) }) };
    })(),
    (() => {
      const endDate = dayjs().add(30, 'day');
      return { endDate, expected: expiryThresholds[30]({ date: formatDate(endDate.toString()) }) };
    })(),
  ])('displays correct alert and modal when plan is expiring in %s days', ({ endDate, expected }) => {
    const budget = { end: endDate }; // Mock data with an expiring budget

    const { result } = renderHook(() => useExpiry('enterpriseId', budget, modalOpen, modalClose, alertOpen, alertClose));

    expect(JSON.stringify(result.current.alert)).toEqual(JSON.stringify(expected.alertTemplate));
    expect(JSON.stringify(result.current.modal)).toEqual(JSON.stringify(expected.modalTemplate));
  });
});
