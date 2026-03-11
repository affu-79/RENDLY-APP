'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallContext } from '@/context/CallContext';
import { getConnections, type Connection } from '@/services/connectionsApi';

const RINGTONE_VIDEO = '/sounds/ringtone.mp3';
const RINGTONE_AUDIO = '/sounds/ringtone-audio.mp3';
/** When ringtone.mp3 is missing, video calls use this so they still ring. */
const RINGTONE_VIDEO_FALLBACK = '/sounds/ringtone-audio.mp3';

export function IncomingCallOverlay() {
  const router = useRouter();
  const {
    incomingCall,
    callState,
    acceptCall,
    rejectCall,
  } = useCallContext();
  const [caller, setCaller] = useState<Connection | null>(null);
  const ringRef = useRef<HTMLAudioElement | null>(null);

  const show = incomingCall != null && callState === 'ringing_incoming';

  useEffect(() => {
    if (!show || !incomingCall) return;
    const initiatorId = incomingCall.initiator_id;
    getConnections()
      .then((list) => {
        const c = list.find((x) => x.id === initiatorId) ?? null;
        setCaller(c);
      })
      .catch(() => setCaller(null));
  }, [show, incomingCall?.initiator_id]);

  useEffect(() => {
    if (!show) {
      if (ringRef.current) {
        ringRef.current.pause();
        ringRef.current.currentTime = 0;
      }
      return;
    }
    const isAudio = incomingCall?.call_type === 'audio';
    const src = isAudio ? RINGTONE_AUDIO : RINGTONE_VIDEO;
    const fallbackSrc = isAudio ? null : RINGTONE_VIDEO_FALLBACK;
    const audio = new Audio(src);
    ringRef.current = audio;
    audio.loop = true;
    const playWithFallback = () => {
      audio.play().catch(() => {
        if (fallbackSrc) {
          audio.src = fallbackSrc;
          audio.play().catch(() => {});
        }
      });
    };
    playWithFallback();
    return () => {
      audio.pause();
      audio.currentTime = 0;
      ringRef.current = null;
    };
  }, [show, incomingCall?.call_type]);

  const handleAccept = () => {
    if (!incomingCall) return;
    acceptCall();
    const convId = incomingCall.conversation_id;
    router.push(`/dashboard/chat?conv=${encodeURIComponent(convId)}`);
  };

  const handleReject = () => {
    rejectCall();
  };

  if (!show || !incomingCall) return null;

  const displayName = caller?.username ?? 'Incoming call';
  const avatarUrl = caller?.avatar_url ?? null;
  const isVideo = incomingCall.call_type !== 'audio';

  return (
    <div
      className="incoming-call-overlay"
      role="dialog"
      aria-label={`Incoming ${isVideo ? 'video' : 'audio'} call from ${displayName}`}
    >
      <div className="incoming-call-overlay-card">
        <div className="incoming-call-overlay-avatar-wrap">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt=""
              width={64}
              height={64}
              className="incoming-call-overlay-avatar"
              unoptimized
            />
          ) : (
            <div className="incoming-call-overlay-avatar-placeholder">
              {(displayName.slice(0, 2) || '?').toUpperCase().replace(/[^A-Z0-9]/g, '') || '?'}
            </div>
          )}
        </div>
        <p className="incoming-call-overlay-name">{displayName}</p>
        <p className="incoming-call-overlay-type">
          {isVideo ? 'Video call' : 'Audio call'}
        </p>
        <div className="incoming-call-overlay-actions">
          <button
            type="button"
            className="incoming-call-overlay-btn incoming-call-overlay-btn--reject"
            onClick={handleReject}
            aria-label="Reject call"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
              <line x1="2" y1="2" x2="22" y2="22" />
            </svg>
            Reject
          </button>
          <button
            type="button"
            className="incoming-call-overlay-btn incoming-call-overlay-btn--accept"
            onClick={handleAccept}
            aria-label="Accept call"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
            </svg>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
