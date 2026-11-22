export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Computes the largest image dimensions that fit inside `container` while
 * preserving the natural aspect ratio. Never returns negative or NaN values.
 */
export function fitDimensions(
  naturalWidth: number,
  naturalHeight: number,
  containerWidth: number,
  containerHeight: number,
): Dimensions {
  if (containerWidth <= 0 || containerHeight <= 0) {
    return { width: 0, height: 0 };
  }
  if (naturalWidth <= 0 || naturalHeight <= 0) {
    return { width: containerWidth, height: containerHeight };
  }

  const ratio = Math.min(
    containerWidth / naturalWidth,
    containerHeight / naturalHeight,
  );
  return {
    width: Math.floor(naturalWidth * ratio),
    height: Math.floor(naturalHeight * ratio),
  };
}
