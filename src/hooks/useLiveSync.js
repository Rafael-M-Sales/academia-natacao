import { useEffect, useRef } from 'react';
import { subscribeLiveUpdates } from '../services/api';
import { DEMO_MODE } from '../config';

export function useLiveSync(enabled, onUpdate) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    if (!enabled || DEMO_MODE) return undefined;

    return subscribeLiveUpdates((payload) => {
      onUpdateRef.current(payload);
    });
  }, [enabled]);
}
