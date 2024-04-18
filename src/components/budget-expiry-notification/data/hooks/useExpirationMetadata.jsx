import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useMemo } from 'react';
import useExpiryThresholds from './useExpiryThresholds';
import { PLAN_EXPIRY_VARIANTS } from '../constants';

dayjs.extend(duration);

const useExpirationMetadata = (endDateStr) => {
  const expiryThresholds = useExpiryThresholds();

  return useMemo(() => {
    const emptyExpirationMetadata = {
      thresholdKey: null,
      threshold: null,
      isPlanApproachingExpiry: false,
    };

    if (!endDateStr) {
      return emptyExpirationMetadata;
    }

    const endDate = dayjs(endDateStr);
    const today = dayjs();
    const durationDiff = dayjs.duration(endDate.diff(today));

    const thresholdKeys = Object.keys(expiryThresholds).sort((a, b) => a - b);
    const thresholdKey = thresholdKeys.find((key) => durationDiff.asDays() >= 0 && durationDiff.asDays() <= key);

    if (!thresholdKey) {
      return emptyExpirationMetadata;
    }

    const threshold = expiryThresholds[thresholdKey]({
      date: endDate.format('MMM D, YYYY'),
      days: durationDiff.days(),
      hours: durationDiff.hours(),
      minutes: durationDiff.minutes(),
    });

    return {
      thresholdKey,
      threshold,
      isPlanApproachingExpiry: threshold.variant === PLAN_EXPIRY_VARIANTS.expiring,
    };
  }, [endDateStr, expiryThresholds]);
};

export default useExpirationMetadata;
