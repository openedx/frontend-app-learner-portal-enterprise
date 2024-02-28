/**
 * Check if system maintenance alert is open, based on configuration.
 * @param {Object} config
 * @returns {boolean}
 */
export function isSystemMaintenanceAlertOpen(config) {
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
}
