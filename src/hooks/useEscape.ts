'use client';

import { useEffect } from 'react';

/**
 * Close a modal/overlay on the Escape key.
 * No-op while `active` is false, so it is safe to call unconditionally.
 */
export function useEscape(active: boolean, onClose: () => void) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [active, onClose]);
}
