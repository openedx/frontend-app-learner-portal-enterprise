/* eslint-disable import/prefer-default-export */

/**
 * Determines whether the application-wide maintenance alert is open.
 *
 * @param {*} config Object representing the application configuration.
 * @returns True if the maintenance alert should be visible.
 */
export const getIsMaintenanceAlertOpen = (config) => {
  if (!config) {
    return false;
  }
  const isEnabledWithMessage = (
    config.IS_MAINTENANCE_ALERT_ENABLED && config.MAINTENANCE_ALERT_MESSAGE
  );
  if (!isEnabledWithMessage) {
    return false;
  }
  const startTimestamp = config.MAINTENANCE_ALERT_START_TIMESTAMP;
  if (startTimestamp) {
    return new Date() > new Date(startTimestamp);
  }
  return true;
};
