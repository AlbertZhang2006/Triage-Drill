import { useState, useEffect } from 'react';

export function useElapsed(startedAt: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(id);
  }, []);
  return Math.floor((now - startedAt) / 60_000);
}
