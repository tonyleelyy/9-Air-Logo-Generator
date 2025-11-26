import { LogoType } from '../types';

/**
 * Calculates the target dimensions for the logo based on the Python script's logic.
 */
export const calculateTargetDimensions = (
  origW: number,
  origH: number,
  outputW: number,
  outputH: number,
  logoType: LogoType
): { width: number; height: number } => {
  if (origH === 0 || origW === 0) {
    throw new Error("Original dimensions cannot be zero.");
  }

  const aspectRatio = origW / origH;
  let targetLw = 0;
  let targetLh = 0;

  switch (logoType) {
    case LogoType.HORIZONTAL: {
      // Rule: P = LH / 2 (all padding)
      const maxLhFromWidth = outputW / (aspectRatio + 1);
      const maxLhFromHeight = outputH / 2;
      targetLh = Math.min(maxLhFromWidth, maxLhFromHeight);
      targetLw = targetLh * aspectRatio;
      break;
    }
    case LogoType.VERTICAL: {
      // Rule: P = LW / 4.6
      const paddingFactor = 1 / 4.6;
      const maxLwFromWidth = outputW / (1 + 2 * paddingFactor);
      const maxLwFromHeight = outputH / ((1 / aspectRatio) + (2 * paddingFactor));
      targetLw = Math.min(maxLwFromWidth, maxLwFromHeight);
      targetLh = targetLw / aspectRatio;
      break;
    }
    case LogoType.ICON: {
      // Rule: P = LH / 4.65
      const paddingFactor = 1 / 4.65;
      const maxLhFromWidth = outputW / (aspectRatio + 2 * paddingFactor);
      const maxLhFromHeight = outputH / (1 + 2 * paddingFactor);
      targetLh = Math.min(maxLhFromWidth, maxLhFromHeight);
      targetLw = targetLh * aspectRatio;
      break;
    }
    default:
      throw new Error(`Unknown Logo Type: ${logoType}`);
  }

  return {
    width: Math.round(targetLw),
    height: Math.round(targetLh),
  };
};

/**
 * Renders the SVG URL onto a canvas with the calculated dimensions and background.
 */
export const renderLogoToCanvas = async (
  svgUrl: string,
  config: { width: number; height: number; type: LogoType; transparent: boolean; format: string }
): Promise<HTMLCanvasElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Important: Allow cross-origin to prevent "tainted canvas" which breaks download
    img.crossOrigin = "Anonymous"; 
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = config.width;
      canvas.height = config.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // 1. Fill Background
      if (!config.transparent) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, config.width, config.height);
      } else {
        ctx.clearRect(0, 0, config.width, config.height);
      }

      // 2. Calculate Dimensions
      // We use the natural width/height of the loaded image
      let origW = img.width;
      let origH = img.height;
      
      // Sometimes SVGs without width/height in header load with 0 or weird dims in Image object
      // But usually modern browsers handle it well if viewBox is present.
      if (origW === 0 || origH === 0) {
           // Fallback or error if completely undeterminable
           // For robust SVG handling, sometimes we fetch text and parse viewBox manually,
           // but `new Image()` usually works for standard SVGs.
           // If 0, try to set a default to prevent crash, or reject.
           // Let's assume valid SVG for now.
           reject(new Error("Unable to determine SVG dimensions."));
           return;
      }

      const targetDims = calculateTargetDimensions(
        origW,
        origH,
        config.width,
        config.height,
        config.type
      );

      // 3. Center Position
      const posX = (config.width - targetDims.width) / 2;
      const posY = (config.height - targetDims.height) / 2;

      // 4. Draw
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, posX, posY, targetDims.width, targetDims.height);

      resolve(canvas);
    };

    img.onerror = () => {
      reject(new Error("Failed to load SVG image from URL."));
    };

    img.src = svgUrl;
  });
};
