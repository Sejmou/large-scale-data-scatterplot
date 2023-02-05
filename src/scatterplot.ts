import { toRadians } from './utils';

/**
 * The scatterplot should fill the entire view frustum of the camera at its current position.
 *
 * This function computes the required dimensions of the "scatterplot plane" so that we can use them to scale the scatterplot point positions accordingly.
 *
 * @param cameraZ
 * @param fov
 * @param width
 * @param height
 * @returns
 */
export function computeScatterplotPlaneDimensions(
  cameraZ: number,
  fov: number,
  width: number,
  height: number
) {
  // The scatterplot plane should fill the entire view frustum of the camera at its current position.
  // ChatGPT taught me how to compute this lol
  const aspectRatio = width / height;
  const scatterplotPlaneWidthIn3DSpace =
    2 * cameraZ * Math.tan(toRadians(fov) / 2) * aspectRatio;
  const scatterplotPlaneHeightIn3DSpace =
    scatterplotPlaneWidthIn3DSpace / aspectRatio;
  return {
    scatterplotPlaneWidth: scatterplotPlaneWidthIn3DSpace,
    scatterPlotPlaneHeight: scatterplotPlaneHeightIn3DSpace,
  };
}
