import dayjs from 'dayjs';
import useExpiryThresholds from './useExpiryThresholds';
import { PLAN_EXPIRY_VARIANTS } from '../constants';

const useExpirationMetadata = (endDateStr = 'January 1, 1970') => {
  const expiryThresholds = useExpiryThresholds();

  const endDate = dayjs(endDateStr);
  const today = dayjs();
  const durationDiff = dayjs.duration(endDate.diff(today));

  const thresholdKeys = Object.keys(expiryThresholds).sort((a, b) => a - b);
  const thresholdKey = thresholdKeys.find((key) => durationDiff.asDays() >= 0 && durationDiff.asDays() <= key);

  if (!thresholdKey) {
    return {
      thresholdKey: null,
      threshold: null,
      isPlanApproachingExpiry: false,
    };
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
};

export default useExpirationMetadata;
