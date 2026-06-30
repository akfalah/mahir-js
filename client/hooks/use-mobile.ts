'use client';

import { useSyncExternalStore } from 'react';

const MOBILE_BREAKPOINT = 768;

function subscribe(callback: () => void) {
  const mediaQueryList = window.matchMedia(
    `(max-width: ${MOBILE_BREAKPOINT - 1}px)`,
  );

  mediaQueryList.addEventListener('change', callback);

  return () => {
    mediaQueryList.removeEventListener('change', callback);
  };
}

function getSnapshot() {
  return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches;
}

function getServerSnapshot() {
  return false;
}

export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
