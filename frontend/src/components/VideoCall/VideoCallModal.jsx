import React, { useRef, useEffect, useState } from 'react';

const VideoCallModal = ({
    socket,
    myId,
    targetId,
    targetName,
    callType, // 'video' | 'audio'
    isIncoming,
    incomingOffer,
    onClose,
}) => {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);

    const [callStatus, setCallStatus] = useState(
        isIncoming ? 'incoming' : 'calling'
    ); // 'calling' | 'incoming' | 'connected' | 'ended'
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [callDuration, setCallDuration] = useState(0);

    // ✅ Free public STUN server — Google ka, bilkul free hai
    const iceServers = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
        ],
    };

    // Call duration timer
    useEffect(() => {
        let interval;
        if (callStatus === 'connected') {
            interval = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [callStatus]);

    const formatDuration = (sec) => {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // ✅ Setup karne ka main function
    useEffect(() => {
        let isMounted = true;

        const setupCall = async () => {
            try {
                // Camera/Mic access lo
                const constraints =
                    callType === 'video'
                        ? { video: true, audio: true }
                        : { video: false, audio: true };

                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                if (!isMounted) return;

                localStreamRef.current = stream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                // PeerConnection banao
                const pc = new RTCPeerConnection(iceServers);
                peerConnectionRef.current = pc;

                // Apna stream add karo
                stream.getTracks().forEach((track) => pc.addTrack(track, stream));

                // Remote stream aane par dikhao
                pc.ontrack = (event) => {
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = event.streams[0];
                    }
                };

                // ICE candidates bhejo
                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        socket.emit('iceCandidate', {
                            to: targetId,
                            candidate: event.candidate,
                        });
                    }
                };

                if (isIncoming) {
                    // ✅ Incoming call — offer set karo, answer banao
                    await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));
                } else {
                    // ✅ Outgoing call — offer banao aur bhejo
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    socket.emit('callUser', {
                        from: myId,
                        to: targetId,
                        offer,
                        callType,
                        callerName: targetName, // backend isse "callerName" bhejega receiver ko
                    });
                }
            } catch (err) {
                console.error('Media/Call setup error:', err);
                alert('Camera/Microphone access denied or not available.');
                onClose();
            }
        };

        setupCall();

        return () => {
            isMounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ✅ Socket listeners
    useEffect(() => {
        // Jab dusra banda call accept kare (sirf caller side pe chalega)
        socket.on('callAccepted', async ({ answer }) => {
            const pc = peerConnectionRef.current;
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
                setCallStatus('connected');
            }
        });

        // ICE candidate receive karo
        socket.on('iceCandidate', async ({ candidate }) => {
            const pc = peerConnectionRef.current;
            if (pc && candidate) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (err) {
                    console.error('Error adding ICE candidate:', err);
                }
            }
        });

        // Call reject hone par
        socket.on('callRejected', () => {
            setCallStatus('ended');
            cleanupCall();
            setTimeout(() => onClose(), 1500);
        });

        // Call end hone par (dusre ne end kiya)
        socket.on('callEnded', () => {
            setCallStatus('ended');
            cleanupCall();
            setTimeout(() => onClose(), 1500);
        });

        // Target offline mila
        socket.on('callFailed', ({ message }) => {
            alert(message || 'Call failed');
            cleanupCall();
            onClose();
        });

        return () => {
            socket.off('callAccepted');
            socket.off('iceCandidate');
            socket.off('callRejected');
            socket.off('callEnded');
            socket.off('callFailed');
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const cleanupCall = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => track.stop());
        }
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
        }
    };

    // ✅ Incoming call accept karo
    const acceptCall = async () => {
        const pc = peerConnectionRef.current;
        if (!pc) return;

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('answerCall', {
            from: myId,
            to: targetId,
            answer,
        });

        setCallStatus('connected');
    };

    // ✅ Call reject karo
    const rejectCall = () => {
        socket.emit('rejectCall', { to: targetId });
        cleanupCall();
        onClose();
    };

    // ✅ Call end karo
    const endCall = () => {
        socket.emit('endCall', { to: targetId });
        cleanupCall();
        onClose();
    };

    // ✅ Mute/Unmute
    const toggleMute = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach((track) => {
                track.enabled = !track.enabled;
            });
            setIsMuted((prev) => !prev);
        }
    };

    // ✅ Video On/Off
    const toggleVideo = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks().forEach((track) => {
                track.enabled = !track.enabled;
            });
            setIsVideoOff((prev) => !prev);
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.85)',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: 480,
                    background: '#1a1a2e',
                    borderRadius: 20,
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                }}
            >
                {/* ── Header ── */}
                <div
                    style={{
                        padding: '20px',
                        textAlign: 'center',
                        color: 'white',
                        background: 'linear-gradient(135deg,#0f4c81,#1a6bb5)',
                    }}
                >
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{targetName}</div>
                    <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
                        {callStatus === 'calling' && 'Calling...'}
                        {callStatus === 'incoming' &&
                            `Incoming ${callType === 'video' ? 'Video' : 'Audio'} Call`}
                        {callStatus === 'connected' && formatDuration(callDuration)}
                        {callStatus === 'ended' && 'Call Ended'}
                    </div>
                </div>

                {/* ── Video Area ── */}
                {callType === 'video' ? (
                    <div
                        style={{
                            position: 'relative',
                            width: '100%',
                            height: 360,
                            background: '#000',
                        }}
                    >
                        {/* Remote video — full size */}
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />

                        {/* Local video — small corner preview */}
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            style={{
                                position: 'absolute',
                                bottom: 12,
                                right: 12,
                                width: 100,
                                height: 130,
                                borderRadius: 10,
                                objectFit: 'cover',
                                border: '2px solid white',
                                background: '#333',
                            }}
                        />
                    </div>
                ) : (
                    // ── Audio Call Avatar ──
                    <div
                        style={{
                            height: 280,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#0a3460',
                        }}
                    >
                        <div
                            style={{
                                width: 96,
                                height: 96,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg,#00c9a7,#0f6e56)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: 36,
                                fontWeight: 700,
                            }}
                        >
                            {targetName?.[0]?.toUpperCase() || '?'}
                        </div>
                        {/* Hidden audio elements — sirf audio chalane ke liye */}
                        <audio ref={remoteVideoRef} autoPlay />
                        <audio ref={localVideoRef} autoPlay muted />
                    </div>
                )}

                {/* ── Controls ── */}
                <div
                    style={{
                        padding: '20px',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 16,
                        background: '#1a1a2e',
                    }}
                >
                    {callStatus === 'incoming' ? (
                        <>
                            {/* Accept */}
                            <button
                                onClick={acceptCall}
                                style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: '50%',
                                    background: '#16a34a',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: 22,
                                    cursor: 'pointer',
                                }}
                            >
                                <i className="fa-solid fa-phone"></i>
                            </button>
                            {/* Reject */}
                            <button
                                onClick={rejectCall}
                                style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: '50%',
                                    background: '#dc2626',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: 22,
                                    cursor: 'pointer',
                                }}
                            >
                                <i className="fa-solid fa-phone-slash"></i>
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Mute */}
                            <button
                                onClick={toggleMute}
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '50%',
                                    background: isMuted ? '#dc2626' : '#374151',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: 18,
                                    cursor: 'pointer',
                                }}
                            >
                                <i className={`fa-solid ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
                            </button>

                            {/* Video toggle — sirf video call mein dikhao */}
                            {callType === 'video' && (
                                <button
                                    onClick={toggleVideo}
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '50%',
                                        background: isVideoOff ? '#dc2626' : '#374151',
                                        border: 'none',
                                        color: 'white',
                                        fontSize: 18,
                                        cursor: 'pointer',
                                    }}
                                >
                                    <i className={`fa-solid ${isVideoOff ? 'fa-video-slash' : 'fa-video'}`}></i>
                                </button>
                            )}

                            {/* End call */}
                            <button
                                onClick={endCall}
                                style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: '50%',
                                    background: '#dc2626',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: 22,
                                    cursor: 'pointer',
                                }}
                            >
                                <i className="fa-solid fa-phone-slash"></i>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoCallModal;