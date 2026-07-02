import { useEffect, useState } from 'react';

const STORAGE_KEY = 'fiveCrowns_feedbackEnabled';

// Sound + haptics share one on-device preference, defaulting off — neither
// should ever buzz or beep unprompted at a real table.
export function useFeedback() {
  const [enabled, setEnabled] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  }, [enabled]);

  return { enabled, toggle: () => setEnabled((v) => !v) };
}
