import { extent } from 'd3';

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

/**
 * This function computes the width and height (in world coordinates) a plane perpendicular to the camera must have so that it fills the entire viewport if the camera is looking right at the middle of it.
 *
 * @param distanceFromCamera
 * @param fov
 * @param viewportWidth
 * @param viewportHeight
 * @returns
 */
export function computeViewportFillingPlaneDimensions(params: {
  distanceFromCamera: number;
  fov: number;
  aspectRatio: number;
}) {
  const { distanceFromCamera, fov, aspectRatio } = params;
  // ChatGPT taught me how to compute this lol
  const planeWidthIn3DSpace =
    2 * distanceFromCamera * Math.tan(toRadians(fov) / 2) * aspectRatio;
  const planeHeightIn3DSpace = planeWidthIn3DSpace / aspectRatio;
  return {
    width: planeWidthIn3DSpace,
    height: planeHeightIn3DSpace,
  };
}

/**
 * Adding a small padding to the extent of the data so that the scatter plot points are not exactly on the edges of the axes
 *
 * This should fix occasionally disappearing axes labels and points right on the edge of the value range that are not hoverable
 *
 * @param data
 * @param padding
 * @returns
 */
export function extentWithPadding<T>(
  data: Iterable<T>,
  accessor: (datum: T) => number,
  padding = 0.000001
) {
  const [min, max] = extent(data, accessor) as [number, number];
  return [min - padding, max + padding];
}
