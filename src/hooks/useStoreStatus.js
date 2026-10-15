import { useCallback, useEffect, useState } from 'react';
import { getStoreStatus } from '../services/storeStatus';
import { estabelecimentoAberto } from '../utils/businessHours';

export default function useStoreStatus() {
  const [manuallyClosed, setManuallyClosed] = useState(null);
  const [error, setError] = useState(null);
  const [, setTick] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const closed = await getStoreStatus();
      setManuallyClosed(closed);
      setError(null);
      return closed;
    } catch (err) {
      setError(err);
      setManuallyClosed(null);
      throw err;
    }
  }, []);

  useEffect(() => {
    let active = true;
    const update = async () => {
      try {
        const closed = await getStoreStatus();
        if (active) { setManuallyClosed(closed); setError(null); }
      } catch (err) {
        if (active) { setError(err); setManuallyClosed(null); }
      }
      if (active) setTick(value => value + 1);
    };
    update();
    const interval = window.setInterval(update, 5000);
    const onVisible = () => { if (document.visibilityState === 'visible') update(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('store-status-changed', update);
    return () => {
      active = false;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('store-status-changed', update);
    };
  }, []);

  const closedMessage = error
    ? 'Não foi possível consultar o funcionamento. Tente novamente em instantes.'
    : manuallyClosed === null
      ? 'Consultando funcionamento da loja...'
      : manuallyClosed
        ? 'Estamos temporariamente fechados. Os pedidos estão pausados até a retomada do atendimento.'
        : 'Estamos fechados. Consulte nosso horário de atendimento.';

  return { manuallyClosed, error, refresh, closedMessage, aberto: manuallyClosed === false && estabelecimentoAberto() };
}
