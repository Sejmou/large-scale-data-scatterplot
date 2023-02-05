export function getScale(cameraZ: number, fov: number, height: number) {
  const halfFov = fov / 2;
  const halfFovRadians = toRadians(halfFov);
  const halfFovHeight = Math.tan(halfFovRadians) * cameraZ;
  const fovHeight = halfFovHeight * 2;
  return height / fovHeight;
}

export function toRadians(angle: number) {
  return angle * (Math.PI / 180);
}

export function getCameraZ(scale: number, fov: number, height: number) {
  const halfFov = fov / 2;
  const halfFovRadians = toRadians(halfFov);
  const scaleHeight = height / scale;
  return scaleHeight / (2 * Math.tan(halfFovRadians));
}
