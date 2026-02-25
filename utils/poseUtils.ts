import { Pose, Results } from "@mediapipe/pose";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

// Initialize MediaPipe Pose
export const createPoseModel = () => {
  const pose = new Pose({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
    },
  });

  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false, // We focus on landmarks for now
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  return pose;
};

// Types for our coordinates
export interface Point {
  x: number;
  y: number;
}

export interface BodyDimensions {
  shoulderWidth: number;
  torsoHeight: number;
  center: Point;
  angle: number;
}

// Calculate body metrics from landmarks
export const calculateBodyMetrics = (landmarks: any[]): BodyDimensions | null => {
  if (!landmarks || landmarks.length < 33) return null;

  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];

  // Calculate center point between shoulders (mid-clavicle)
  const centerX = (leftShoulder.x + rightShoulder.x) / 2;
  const centerY = (leftShoulder.y + rightShoulder.y) / 2;

  // Calculate shoulder width (distance between 11 and 12)
  const shoulderWidth = Math.sqrt(
    Math.pow(rightShoulder.x - leftShoulder.x, 2) +
    Math.pow(rightShoulder.y - leftShoulder.y, 2)
  );

  // Calculate torso height (mid-shoulder to mid-hip)
  const midHipX = (leftHip.x + rightHip.x) / 2;
  const midHipY = (leftHip.y + rightHip.y) / 2;
  
  const torsoHeight = Math.sqrt(
    Math.pow(midHipX - centerX, 2) +
    Math.pow(midHipY - centerY, 2)
  );

  // Calculate angle of shoulders (for rotation)
  // atan2(dy, dx) gives angle in radians
  const angle = Math.atan2(
    rightShoulder.y - leftShoulder.y,
    rightShoulder.x - leftShoulder.x
  );

  return {
    shoulderWidth,
    torsoHeight,
    center: { x: centerX, y: centerY },
    angle
  };
};
