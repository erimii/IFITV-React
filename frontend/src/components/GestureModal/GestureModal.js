import React, { useRef, useEffect, useState } from "react";
import './GestureModal.css';

function GestureModal({ profiles, currentProfile, onClose, onRecognized }) {
  const videoRef = useRef(null);
  const cameraRef = useRef(null);
  const [gesture, setGesture] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const startCamera = () => {
    if (!videoRef.current) return;

    const hands = new window.Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.8,
      minTrackingConfidence: 0.8,
    });

    hands.onResults((results) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const joints = results.multiHandLandmarks[0].map((lm) => [lm.x, lm.y, lm.z]);
        sendToServer(joints);
      }
    });

    const cam = new window.Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) {
          await hands.send({ image: videoRef.current });
        }
      },
      width: 640,
      height: 480,
    });

    cameraRef.current = cam;
    cam.start().then(() => {
      setIsCameraReady(true);
    });
  };

  useEffect(() => {
    if (!isCameraActive) return;

    const timer = setInterval(() => {
      if (videoRef.current) {
        clearInterval(timer);
        startCamera();
      }
    }, 100);

    return () => clearInterval(timer);
  }, [isCameraActive]);

  const sendToServer = (joints) => {
    if (gesture) return;

    fetch("http://localhost:8000/api/predict_gesture/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ joints }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.result || data.result === "unknown") {
          console.warn("제스처 인식 실패: unknown");
        }
        setGesture(data.result);
      })
      .catch((err) => {
        console.error("서버 통신 오류:", err);
      });
  };

  useEffect(() => {
    if (!gesture || gesture === "unknown") return;

    const matched = profiles.find((p) => p.gesture === gesture);
    if (matched) {
      setIsCameraActive(false);
      if (cameraRef.current) cameraRef.current.stop();
      onRecognized(matched);
      onClose();
    } else {
      console.log("제스처는 인식됐지만 매칭된 프로필 없음:", gesture);
      setGesture("no_match");
    }
  }, [gesture, profiles, isCameraActive]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="profile-switch-overlay" onClick={onClose}>
      <div className="profile-switch-modal" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="profile-switch-close">&times;</button>
        <div className="profile-switch-title">프로필 전환</div>

        <div className="profile-switch-video-wrapper">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="profile-switch-image-rect"
            style={{ visibility: isCameraReady ? "visible" : "hidden" }}
          />
          {!isCameraReady && (
            <div className="profile-switch-skeleton-video" />
          )}
        </div>

        {gesture === "no_match" && (
          <div style={{ marginTop: "1rem", color: "red", fontWeight: "bold" }}>
            ⚠️ 매칭된 프로필이 없습니다
          </div>
        )}

        <div className="profile-switch-desc">프로필 수동 전환</div>
        <div className="profile-switch-list">
          {profiles && profiles.length > 0 ? (
            profiles.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onRecognized(p);
                  onClose();
                }}
                className="profile-switch-profile-btn"
              >
                <div className="profile-switch-profile-item">
                  <div className="profile-switch-avatar-circle">
                    {p.gesture && (
                      p.gesture === "rock" ? "✊" :
                      p.gesture === "paper" ? "🖐" :
                      p.gesture === "scissors" ? "✌️" :
                      p.gesture === "ok" ? "👌" :
                      "❓"
                    )}
                  </div>
                  <div className="profile-switch-name">{p.name}</div>
                </div>
              </button>
            ))
          ) : (
            <div style={{ color: "#888", fontSize: "1.2rem" }}>등록된 프로필이 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GestureModal;
