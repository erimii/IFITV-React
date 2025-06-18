import React, { useRef, useEffect, useState } from "react";

function GestureModal({profiles, onClose, onRecognized}) {
  const videoRef = useRef(null);
  const cameraRef = useRef(null);
  const [gesture, setGesture] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(true); // 카메라 활성 상태

  // 카메라 시작 함수
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
      if (
        results.multiHandLandmarks &&
        results.multiHandLandmarks.length > 0
      ) {
        const joints = results.multiHandLandmarks[0].map((lm) => [
          lm.x,
          lm.y,
          lm.z,
        ]);
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
    cam.start();
  };

  // 최초 실행
  useEffect(() => {
    if (!isCameraActive) return;
  
    const timer = setInterval(() => {
      if (videoRef.current) {
        clearInterval(timer);  // 준비된 시점에서 camera 시작
        startCamera();
      }
    }, 100);  // 100ms 간격으로 체크
  
    return () => clearInterval(timer);
  }, [isCameraActive]);
  
  // 손모양 좌표 전송
  const sendToServer = (joints) => {
    if (gesture) return;
  
    fetch("http://localhost:8000/api/predict_gesture/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ joints }),
    })
      .then((res) => res.json())
      .then((data) => {
        // 👉 result가 unknown이면 무시하고 계속 인식 반복
        if (!data.result || data.result === "unknown") {
          console.warn("제스처 인식 실패: unknown");
        }
  
        // 정상 인식 시 처리
        setGesture(data.result);

      })
      .catch((err) => {
        console.error("서버 통신 오류:", err);
      });
  };

  // 손모양 인식 결과를 가지고 프로필 찾기
  useEffect(() => {
    
    if (!gesture || gesture === "unknown") return;
  
    const matched = profiles.find((p) => p.gesture === gesture);
    if (matched) {
      setIsCameraActive(false);
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      onRecognized(matched);
      onClose(); 
    } else {
      console.log("제스처는 인식됐지만 매칭된 프로필 없음:", gesture);
      setGesture("no_match");
      return;
    }
  }, [gesture, profiles, isCameraActive]);

  return (
    <div style={modalStyle}>
      <div style={modalContentStyle}>
        <button
            onClick={onClose}
            style={{
                background: "transparent",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
            }}
            >
            ✖
        </button>
        <h1>프로필 전환</h1>
        {isCameraActive && (
          <video
            ref={videoRef}
            autoPlay
            style={{
                width: "100%",
                maxWidth: "100%",
                height: "auto", 
                borderRadius: "0.5rem",
                display: isCameraActive ? "block" : "none",
              }}
          />
        )}
        {gesture && (
        <div style={{ marginTop: "1rem", color: "red", fontWeight: "bold" }}>
            ⚠️ 매칭된 프로필이 없습니다
        </div>
        )}
        <div style={{ marginTop: "2rem" }}>
            <h3>👤 프로필 수동 전환</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
                {profiles.map((p) => (
                <button
                    key={p.id}
                    onClick={() => {
                    onRecognized(p); // 수동 선택
                    onClose();
                    }}
                    style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "999px",
                    border: "1px solid #aaa",
                    cursor: "pointer",
                    background: "#f0f0f0",
                    }}
                >
                    {p.name} ({p.gesture && (
                        p.gesture === "rock" ? "✊" :
                        p.gesture === "paper" ? "🖐" :
                        p.gesture === "scissors" ? "✌️" :
                        p.gesture === "ok" ? "👌" :
                        "❓"
                    )})
                </button>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
  
}
const modalStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };

const modalContentStyle = {
background: "white",
padding: "2rem",
borderRadius: "1rem",
width: "90%",
maxWidth: "500px",
textAlign: "center",
};
  
export default GestureModal;
