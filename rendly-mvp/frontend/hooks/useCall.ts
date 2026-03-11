'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import websocket from '@/services/websocket';
import { chat } from '@/services/chat';

const STUN_SERVER = 'stun:stun.l.google.com:19302';

export type CallState = 'idle' | 'ringing_outgoing' | 'ringing_incoming' | 'active';

export type IncomingCall = {
  conversation_id: string;
  call_type: string;
  initiator_id: string;
  call_log_id: string | null;
};

export type UseCallOptions = {
  onCallEnded?: (conversationId: string) => void;
};

export function useCall(currentUserId: string | null, options?: UseCallOptions) {
  const { onCallEnded } = options ?? {};
  const [callState, setCallState] = useState<CallState>('idle');
  const [callType, setCallType] = useState<'audio' | 'video'>('video');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [callLogId, setCallLogId] = useState<string | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStreamState] = useState<MediaStream | null>(null);
  const [remoteScreenStream, setRemoteScreenStream] = useState<MediaStream | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const callStartedAtRef = useRef<number | null>(null);
  const isCallerRef = useRef<boolean>(false);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const remoteScreenStreamRef = useRef<MediaStream | null>(null);
  /** Single remote MediaStream; we add each incoming track here so audio+video stay in one stream. */
  const remoteStreamRef = useRef<MediaStream | null>(null);

  const cleanupMedia = useCallback(() => {
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;
    setScreenStreamState(null);
    setRemoteScreenStream(null);
    setIsScreenSharing(false);
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    localStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    setRemoteStream(null);
    remoteStreamRef.current?.getTracks().forEach((t) => t.stop());
    remoteStreamRef.current = null;
    setCallState('idle');
    setConversationId(null);
    setCallLogId(null);
    setIncomingCall(null);
    callStartedAtRef.current = null;
  }, [localStream]);

  const endCallWithLog = useCallback(
    async (status: 'completed' | 'missed' | 'rejected' | 'cancelled') => {
      const convId = conversationId;
      const cid = callLogId;
      const started = callStartedAtRef.current;
      if (cid && currentUserId) {
        const duration =
          status === 'completed' && started != null ? Math.round((Date.now() - started) / 1000) : undefined;
        try {
          await chat.endCall(cid, status, duration);
        } catch {
          // best effort
        }
        if (convId) onCallEnded?.(convId);
      }
      cleanupMedia();
    },
    [conversationId, callLogId, currentUserId, onCallEnded, cleanupMedia]
  );

  useEffect(() => {
    const handleIncoming = (payload: IncomingCall) => {
      setIncomingCall(payload);
      setCallType((payload.call_type === 'audio' ? 'audio' : 'video') as 'audio' | 'video');
      setConversationId(payload.conversation_id);
      setCallLogId(payload.call_log_id);
      setCallState('ringing_incoming');
    };
    const handleAccepted = (payload: { conversation_id: string; call_log_id: string | null }) => {
      if (conversationId !== payload.conversation_id) return;
      setCallLogId((prev) => prev ?? payload.call_log_id);
      setCallState('active');
      callStartedAtRef.current = Date.now();
      isCallerRef.current = true; // we were ringing_outgoing, so we are the caller
    };
    const handleRejected = (payload: { conversation_id: string; call_log_id: string | null }) => {
      if (conversationId !== payload.conversation_id) return;
      endCallWithLog('rejected');
    };
    const handleEnded = (payload: { conversation_id: string; call_log_id: string | null; status: string }) => {
      if (conversationId !== payload.conversation_id) return;
      endCallWithLog((payload.status as 'completed' | 'missed' | 'rejected' | 'cancelled') || 'completed');
    };

    websocket.onCallIncoming(handleIncoming);
    websocket.onCallAccepted(handleAccepted);
    websocket.onCallRejected(handleRejected);
    websocket.onCallEnded(handleEnded);

    return () => {
      websocket.onCallIncoming(() => { });
      websocket.onCallAccepted(() => { });
      websocket.onCallRejected(() => { });
      websocket.onCallEnded(() => { });
    };
  }, [conversationId, endCallWithLog]);

  const startCall = useCallback(
    async (convId: string, type: 'audio' | 'video') => {
      if (!currentUserId) return;
      isCallerRef.current = true;
      try {
        const result = await chat.startCall(convId, type);
        const logId = result?.call_log_id ?? null;
        setCallLogId(logId);
        setConversationId(convId);
        setCallType(type);
        setCallState('ringing_outgoing');
        setIncomingCall(null);
        websocket.emitCallStart(convId, type, currentUserId, logId ?? undefined);
      } catch {
        setCallState('idle');
        isCallerRef.current = false;
      }
    },
    [currentUserId]
  );

  const acceptCall = useCallback(async () => {
    const inc = incomingCall;
    if (!inc || !currentUserId) return;
    isCallerRef.current = false;
    const convId = inc.conversation_id;
    const type = (inc.call_type === 'audio' ? 'audio' : 'video') as 'audio' | 'video';
    setCallState('active');
    setConversationId(convId);
    setCallLogId(inc.call_log_id);
    setIncomingCall(null);
    callStartedAtRef.current = Date.now();
    websocket.emitCallAccept(convId, currentUserId, inc.call_log_id ?? undefined);

    const pc = new RTCPeerConnection({ iceServers: [{ urls: STUN_SERVER }] });
    pcRef.current = pc;

    const stream = await navigator.mediaDevices.getUserMedia(type === 'video' ? { audio: true, video: true } : { audio: true });
    setLocalStream(stream);
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.ontrack = (e) => {
      const tr = e.track;
      const displaySurface = tr.getSettings?.().displaySurface;
      const isScreen = displaySurface === 'monitor' || displaySurface === 'browser';
      if (isScreen) {
        const str = e.streams[0];
        if (str) {
          setRemoteScreenStream(str);
          const clearRemoteScreen = () => setRemoteScreenStream(null);
          tr.onended = clearRemoteScreen;
          str.getTracks().forEach((t) => { t.onended = clearRemoteScreen; });
        }
      } else {
        if (!remoteStreamRef.current) remoteStreamRef.current = new MediaStream();
        remoteStreamRef.current.addTrack(tr);
        setRemoteStream(new MediaStream(remoteStreamRef.current.getTracks()));
      }
    };
    pc.onicecandidate = (e) => {
      if (e.candidate) websocket.emitWebrtcIceCandidate(convId, currentUserId, e.candidate.toJSON());
    };

    const offerHandler = async (payload: { conversation_id: string; user_id: string; sdp: RTCSessionDescriptionInit }) => {
      if (payload.conversation_id !== convId || !payload.sdp) return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        setTimeout(() => {
          const stream = remoteScreenStreamRef.current;
          if (
            stream &&
            (!stream.active ||
              stream.getTracks().length === 0 ||
              stream.getTracks().every((t) => t.readyState === 'ended'))
          ) {
            setRemoteScreenStream(null);
          }
        }, 150);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        websocket.emitWebrtcAnswer(convId, currentUserId, answer);
      } catch (err) {
        console.error('Accept call setRemoteDescription/createAnswer:', err);
      }
    };
    websocket.onWebrtcOffer(offerHandler);

    const iceHandler = (payload: { conversation_id: string; user_id: string; candidate: RTCIceCandidateInit }) => {
      if (payload.conversation_id !== convId || !payload.candidate) return;
      pc.addIceCandidate(new RTCIceCandidate(payload.candidate)).catch(() => { });
    };
    websocket.onWebrtcIceCandidate(iceHandler);

    return () => {
      websocket.onWebrtcOffer(() => { });
      websocket.onWebrtcIceCandidate(() => { });
    };
  }, [incomingCall, currentUserId]);

  const rejectCall = useCallback(() => {
    const inc = incomingCall;
    if (inc) {
      websocket.emitCallReject(inc.conversation_id, inc.call_log_id ?? undefined, currentUserId ?? undefined);
      if (inc.call_log_id && currentUserId) {
        chat.endCall(inc.call_log_id, 'rejected').catch(() => { });
      }
    }
    setIncomingCall(null);
    setCallState('idle');
    setConversationId(null);
    setCallLogId(null);
  }, [incomingCall, currentUserId]);

  const endCall = useCallback(() => {
    const convId = conversationId;
    if (convId) websocket.emitCallEnd(convId, callLogId ?? undefined, 'cancelled', currentUserId ?? undefined);
    endCallWithLog(callState === 'ringing_outgoing' ? 'cancelled' : 'completed');
  }, [conversationId, callLogId, callState, currentUserId, endCallWithLog]);

  useEffect(() => {
    if (callState !== 'active') return;
    if (!isCallerRef.current) return; // callee already set up PC in acceptCall
    if (pcRef.current) return; // already created (e.g. Strict Mode double-mount)
    const convId = conversationId;
    if (!convId || !currentUserId) return;

    const pc = new RTCPeerConnection({ iceServers: [{ urls: STUN_SERVER }] });
    pcRef.current = pc;

    const answerHandler = async (payload: { conversation_id: string; user_id: string; sdp: RTCSessionDescriptionInit }) => {
      if (payload.conversation_id !== convId || payload.user_id === currentUserId || !payload.sdp) return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      } catch (err) {
        console.error('Caller setRemoteDescription answer:', err);
      }
    };
    const offerHandler = async (payload: { conversation_id: string; user_id: string; sdp: RTCSessionDescriptionInit }) => {
      if (payload.conversation_id !== convId || payload.user_id === currentUserId || !payload.sdp) return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        websocket.emitWebrtcAnswer(convId, currentUserId, answer);
      } catch (err) {
        console.error('Caller setRemoteDescription/createAnswer (renegotiation):', err);
      }
    };
    const iceHandler = (payload: { conversation_id: string; user_id: string; candidate: RTCIceCandidateInit }) => {
      if (payload.conversation_id !== convId || payload.user_id === currentUserId || !payload.candidate) return;
      pc.addIceCandidate(new RTCIceCandidate(payload.candidate)).catch(() => { });
    };
    websocket.onWebrtcAnswer(answerHandler);
    websocket.onWebrtcOffer(offerHandler);
    websocket.onWebrtcIceCandidate(iceHandler);

    let stream: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia(callType === 'video' ? { audio: true, video: true } : { audio: true })
      .then((s) => {
        stream = s;
        setLocalStream(s);
        s.getTracks().forEach((track) => pc.addTrack(track, s));
        pc.ontrack = (e) => {
          const track = e.track;
          const displaySurface = track.getSettings?.().displaySurface;
          const isScreen = displaySurface === 'monitor' || displaySurface === 'browser';
          if (isScreen) {
            const stream = e.streams[0];
            if (stream) {
              setRemoteScreenStream(stream);
              const clearRemoteScreen = () => setRemoteScreenStream(null);
              track.onended = clearRemoteScreen;
              stream.getTracks().forEach((t) => { t.onended = clearRemoteScreen; });
            }
          } else {
            if (!remoteStreamRef.current) remoteStreamRef.current = new MediaStream();
            remoteStreamRef.current.addTrack(track);
            setRemoteStream(new MediaStream(remoteStreamRef.current.getTracks()));
          }
        };
        pc.onicecandidate = (e) => {
          if (e.candidate) websocket.emitWebrtcIceCandidate(convId, currentUserId, e.candidate.toJSON());
        };
        return pc.createOffer();
      })
      .then((offer) => {
        if (!pcRef.current) return;
        return pc.setLocalDescription(offer).then(() => {
          websocket.emitWebrtcOffer(convId, currentUserId, offer);
        });
      })
      .catch((err) => {
        console.error('Caller getUserMedia/createOffer:', err);
        endCallWithLog('cancelled');
      });

    return () => {
      websocket.onWebrtcAnswer(() => { });
      websocket.onWebrtcOffer(() => { });
      websocket.onWebrtcIceCandidate(() => { });
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [callState === 'active' ? conversationId : null, currentUserId, callType]);

  const toggleMute = useCallback(() => {
    localStream?.getAudioTracks().forEach((t) => {
      t.enabled = isMuted;
    });
    setIsMuted((m) => !m);
  }, [localStream, isMuted]);

  const toggleVideo = useCallback(() => {
    localStream?.getVideoTracks().forEach((t) => {
      t.enabled = isVideoOff;
    });
    setIsVideoOff((v) => !v);
  }, [localStream, isVideoOff]);

  const toggleScreenShare = useCallback(async () => {
    const pc = pcRef.current;
    const convId = conversationId;
    if (!pc || !convId || !currentUserId) return;

    if (isScreenSharing && screenStreamRef.current) {
      const stream = screenStreamRef.current;
      const senders = pc.getSenders();
      stream.getTracks().forEach((track) => {
        const sender = senders.find((s) => s.track === track);
        if (sender) pc.removeTrack(sender);
      });
      stream.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      setScreenStreamState(null);
      setIsScreenSharing(false);
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        websocket.emitWebrtcOffer(convId, currentUserId, offer);
      } catch (err) {
        console.error('Screen share off renegotiate:', err);
      }
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      screenStreamRef.current = screenStream;
      setScreenStreamState(screenStream);
      screenStream.getTracks().forEach((track) => pc.addTrack(track, screenStream));
      setIsScreenSharing(true);
      screenStream.getTracks().forEach((track) => {
        track.onended = () => {
          if (screenStreamRef.current === screenStream) {
            screenStreamRef.current = null;
            setScreenStreamState(null);
            setIsScreenSharing(false);
            const senders = pc.getSenders();
            screenStream.getTracks().forEach((t) => {
              const sender = senders.find((s) => s.track === t);
              if (sender) pc.removeTrack(sender);
            });
            pc.createOffer().then((offer) => pc.setLocalDescription(offer)).then(() => {
              if (convId && currentUserId) websocket.emitWebrtcOffer(convId, currentUserId, pc.localDescription!);
            }).catch(() => { });
          }
        };
      });
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      websocket.emitWebrtcOffer(convId, currentUserId, offer);
    } catch (err) {
      console.error('Screen share getDisplayMedia:', err);
    }
  }, [conversationId, currentUserId, isScreenSharing]);

  useEffect(() => {
    remoteScreenStreamRef.current = remoteScreenStream;
  }, [remoteScreenStream]);

  // Fallback: clear remote screen when stream tracks end or stream inactive (presentee sees screen until we clear)
  useEffect(() => {
    const stream = remoteScreenStream;
    if (!stream) return;
    const id = setInterval(() => {
      if (!stream.active) {
        setRemoteScreenStream(null);
        return;
      }
      const tracks = stream.getTracks();
      const emptyOrAllEnded =
        tracks.length === 0 || (tracks.length > 0 && tracks.every((t) => t.readyState === 'ended'));
      if (emptyOrAllEnded) {
        setRemoteScreenStream(null);
      }
    }, 100);
    return () => clearInterval(id);
  }, [remoteScreenStream]);

  const showScreenShareLayout = (isScreenSharing && !!screenStream) || !!remoteScreenStream;

  return {
    callState,
    callType,
    conversationId,
    callLogId,
    incomingCall,
    remoteStream,
    localStream,
    screenStream,
    remoteScreenStream,
    showScreenShareLayout,
    isMuted,
    isVideoOff,
    isScreenSharing,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    cleanupMedia,
  };
}
