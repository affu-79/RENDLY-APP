'use client';

import React, { useCallback, useRef, useEffect } from 'react';
import { useCurrentUser } from '@/context/CurrentUserContext';
import {
  useCall,
  type CallState,
  type IncomingCall,
} from '@/hooks/useCall';

export type { CallState, IncomingCall };

export type CallContextValue = ReturnType<typeof useCall> & {
  registerOnCallEnded: (callback: (conversationId: string) => void) => () => void;
};

const CallContext = React.createContext<CallContextValue | null>(null);

export function useCallContext(): CallContextValue {
  const ctx = React.useContext(CallContext);
  if (!ctx) throw new Error('useCallContext must be used within CallProvider');
  return ctx;
}

export function CallProvider({ children }: { children: React.ReactNode }) {
  const { user } = useCurrentUser();
  const currentUserId = user?.id ?? null;
  const onCallEndedCallbacksRef = useRef<Set<(conversationId: string) => void>>(new Set());

  const handleCallEnded = useCallback((conversationId: string) => {
    onCallEndedCallbacksRef.current.forEach((cb) => {
      try {
        cb(conversationId);
      } catch {
        // ignore
      }
    });
  }, []);

  const call = useCall(currentUserId, {
    onCallEnded: handleCallEnded,
  });

  const registerOnCallEnded = useCallback((callback: (conversationId: string) => void) => {
    onCallEndedCallbacksRef.current.add(callback);
    return () => {
      onCallEndedCallbacksRef.current.delete(callback);
    };
  }, []);

  const value: CallContextValue = {
    ...call,
    registerOnCallEnded,
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
}
