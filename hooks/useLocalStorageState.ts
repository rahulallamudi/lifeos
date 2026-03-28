"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

const LOCAL_STORAGE_EVENT = "lifeos-local-storage";

function readStorageValue<T>(key: string, fallback: T) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const storedValue = window.localStorage.getItem(key);

    if (!storedValue) {
      return fallback;
    }

    return JSON.parse(storedValue) as T;
  } catch {
    return fallback;
  }
}

export function useLocalStorageState<T>(key: string, initialValue: T) {
  const fallbackRef = useRef(initialValue);
  const fallback = fallbackRef.current;

  const subscribe = useCallback(
    (listener: () => void) => {
      if (typeof window === "undefined") {
        return () => {};
      }

      const handleStorage = (event: StorageEvent) => {
        if (event.key === key) {
          listener();
        }
      };

      const handleCustomEvent = (event: Event) => {
        const customEvent = event as CustomEvent<string>;

        if (customEvent.detail === key) {
          listener();
        }
      };

      window.addEventListener("storage", handleStorage);
      window.addEventListener(LOCAL_STORAGE_EVENT, handleCustomEvent);

      return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener(LOCAL_STORAGE_EVENT, handleCustomEvent);
      };
    },
    [key]
  );

  const getSnapshot = useCallback(() => {
    return readStorageValue(key, fallback);
  }, [fallback, key]);

  const value = useSyncExternalStore(subscribe, getSnapshot, () => fallback);

  const setValue = useCallback(
    (nextValue: T | ((currentValue: T) => T)) => {
      if (typeof window === "undefined") {
        return;
      }

      const resolvedValue =
        typeof nextValue === "function"
          ? (nextValue as (currentValue: T) => T)(
              readStorageValue(key, fallback)
            )
          : nextValue;

      window.localStorage.setItem(key, JSON.stringify(resolvedValue));
      window.dispatchEvent(
        new CustomEvent<string>(LOCAL_STORAGE_EVENT, {
          detail: key,
        })
      );
    },
    [fallback, key]
  );

  return [value, setValue] as const;
}
