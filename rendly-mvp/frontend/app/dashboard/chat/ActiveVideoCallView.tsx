'use client';

import React, { useEffect, useRef } from 'react';

function MuteIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

function VideoOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M16 16v1a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2m5.66 0H14a2 2 0 002-2V4a2 2 0 00-2-2h-1" />
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M23 7v10a2 2 0 01-2 2h-1" />
    </svg>
  );
}

function ScreenShareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function EndCallIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

export type ActiveVideoCallViewProps = {
  showScreenShare: boolean;
  screenStream: MediaStream | null;
  remoteScreenStream: MediaStream | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onEndCall: () => void;
};

export function ActiveVideoCallView({
  showScreenShare,
  screenStream,
  remoteScreenStream,
  localStream,
  remoteStream,
  isMuted,
  isVideoOff,
  isScreenSharing,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onEndCall,
}: ActiveVideoCallViewProps) {
  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteStackRef = useRef<HTMLVideoElement>(null);
  const localStackRef = useRef<HTMLVideoElement>(null);

  const screenShareStream = screenStream ?? remoteScreenStream;

  useEffect(() => {
    const el = mainVideoRef.current;
    if (!el) return;
    if (showScreenShare && screenShareStream) {
      el.srcObject = screenShareStream;
      el.play().catch(() => {});
    } else {
      el.srcObject = null;
    }
    return () => {
      if (el) el.srcObject = null;
    };
  }, [showScreenShare, screenShareStream]);

  useEffect(() => {
    const el = remoteVideoRef.current;
    if (!el) return;
    if (!showScreenShare && remoteStream) {
      el.srcObject = remoteStream;
      el.play().catch(() => {});
    } else {
      el.srcObject = null;
    }
  }, [showScreenShare, remoteStream]);

  useEffect(() => {
    const el = localVideoRef.current;
    if (!el) return;
    if (!showScreenShare && localStream) {
      el.srcObject = localStream;
    } else {
      el.srcObject = null;
    }
  }, [showScreenShare, localStream]);

  useEffect(() => {
    const el = remoteStackRef.current;
    if (!el) return;
    if (showScreenShare && remoteStream) {
      el.srcObject = remoteStream;
      el.play().catch(() => {});
    } else {
      el.srcObject = null;
    }
  }, [showScreenShare, remoteStream]);

  useEffect(() => {
    const el = localStackRef.current;
    if (!el) return;
    if (showScreenShare && localStream) {
      el.srcObject = localStream;
    } else {
      el.srcObject = null;
    }
  }, [showScreenShare, localStream]);

  return (
    <div className="chat-call-ui chat-call-ui--active">
      {showScreenShare ? (
        <>
          <div className="chat-call-video-main">
            <video ref={mainVideoRef} autoPlay playsInline muted={false} className="chat-call-video-el" />
          </div>
          <div className="chat-call-video-stack">
            <video ref={remoteStackRef} autoPlay playsInline muted={false} className="chat-call-video-el chat-call-video-el--stack" />
            <video ref={localStackRef} autoPlay playsInline muted className="chat-call-video-el chat-call-video-el--stack" />
          </div>
        </>
      ) : (
        <>
          <div className="chat-call-video-remote">
            <video ref={remoteVideoRef} autoPlay playsInline muted={false} className="chat-call-video-el" />
          </div>
          <div className="chat-call-video-local">
            <video ref={localVideoRef} autoPlay playsInline muted className="chat-call-video-el" />
          </div>
        </>
      )}
      <div className="chat-call-controls">
        <button
          type="button"
          className={`chat-call-ctrl-btn ${isMuted ? 'chat-call-ctrl-btn--on' : ''}`}
          onClick={onToggleMute}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          <MuteIcon />
        </button>
        <button
          type="button"
          className={`chat-call-ctrl-btn ${isVideoOff ? 'chat-call-ctrl-btn--on' : ''}`}
          onClick={onToggleVideo}
          aria-label={isVideoOff ? 'Turn video on' : 'Turn video off'}
        >
          <VideoOffIcon />
        </button>
        <button
          type="button"
          className={`chat-call-ctrl-btn ${isScreenSharing ? 'chat-call-ctrl-btn--on' : ''}`}
          onClick={onToggleScreenShare}
          aria-label={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
          aria-pressed={isScreenSharing}
        >
          <ScreenShareIcon />
        </button>
        <button type="button" className="chat-call-ctrl-btn chat-call-ctrl-btn--danger" onClick={onEndCall} aria-label="End call">
          <EndCallIcon />
        </button>
      </div>
    </div>
  );
}
