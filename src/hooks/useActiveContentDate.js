// src/hooks/useActiveContentDate.js

import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { getActiveContentDateKey, getNextCutoffDate } from '../utils/dateLogic';

// Zwraca klucz aktywnego dnia treści (YYYY-MM-DD) i reaktywnie
// przełącza go dokładnie o 11:11, bez restartu aplikacji.
export default function useActiveContentDate() {
  const [activeDateKey, setActiveDateKey] = useState(() =>
    getActiveContentDateKey()
  );
  const timeoutRef = useRef(null);

  useEffect(() => {
    const scheduleNextFlip = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const now = new Date();
      const next = getNextCutoffDate(now);
      const delay = next.getTime() - now.getTime();

      timeoutRef.current = setTimeout(() => {
        setActiveDateKey(getActiveContentDateKey());
        scheduleNextFlip();
      }, delay);
    };

    scheduleNextFlip();

    // Aplikacja w tle może zostać wstrzymana przez system operacyjny,
    // więc przy powrocie na pierwszy plan przeliczamy stan od nowa.
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        setActiveDateKey(getActiveContentDateKey());
        scheduleNextFlip();
      }
    });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      subscription.remove();
    };
  }, []);

  return activeDateKey;
}
