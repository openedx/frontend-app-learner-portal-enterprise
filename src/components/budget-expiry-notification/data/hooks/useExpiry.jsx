import { useState, useEffect } from 'react';
import {
  getEnterpriseBudgetExpiringAlertCookieName,
  getEnterpriseBudgetExpiringModalCookieName,
} from '../utils';
import useExpirationMetadata from './useExpirationMetadata';

const useExpiry = (enterpriseId, budget, modalOpen, modalClose, alertOpen, alertClose) => {
  const [alert, setAlert] = useState(null);
  const [expirationThreshold, setExpirationThreshold] = useState(null);
  const [modal, setModal] = useState(null);
  const { thresholdKey, threshold } = useExpirationMetadata(budget?.end);

  useEffect(() => {
    if (!budget || thresholdKey === null) {
      return;
    }

    const { alertTemplate, modalTemplate } = threshold;

    setAlert(alertTemplate);
    setModal(modalTemplate);
    setExpirationThreshold({
      thresholdKey,
      threshold,
    });

    const seenCurrentExpiringModalCookieName = getEnterpriseBudgetExpiringModalCookieName({
      expirationThreshold: thresholdKey,
      enterpriseId,
    });

    const seenCurrentExpiringAlertCookieName = getEnterpriseBudgetExpiringAlertCookieName({
      expirationThreshold: thresholdKey,
      enterpriseId,
    });

    const isModalDismissed = global.localStorage.getItem(seenCurrentExpiringModalCookieName);
    const isAlertDismissed = global.localStorage.getItem(seenCurrentExpiringAlertCookieName);

    if (!isModalDismissed) {
      modalOpen();
    }

    if (!isAlertDismissed) {
      alertOpen();
    }
  }, [budget, modalOpen, alertOpen, enterpriseId, thresholdKey, threshold]);

  const dismissModal = () => {
    const seenCurrentExpirationModalCookieName = getEnterpriseBudgetExpiringModalCookieName({
      expirationThreshold: expirationThreshold.thresholdKey,
      enterpriseId,
    });

    global.localStorage.setItem(seenCurrentExpirationModalCookieName, 'true');

    modalClose();
  };

  const dismissAlert = () => {
    const seenCurrentExpirationAlertCookieName = getEnterpriseBudgetExpiringAlertCookieName({
      expirationThreshold: expirationThreshold.thresholdKey,
      enterpriseId,
    });

    global.localStorage.setItem(seenCurrentExpirationAlertCookieName, 'true');

    alertClose();
  };

  return {
    alert, modal, dismissModal, dismissAlert,
  };
};

export default useExpiry;
