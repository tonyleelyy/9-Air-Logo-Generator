// DPI adjustment utilities for PNG and JPEG

// Simple CRC32 table for PNG chunks
const makeCRCTable = () => {
  let c;
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    crcTable[n] = c;
  }
  return crcTable;
};
const crcTable = makeCRCTable();

const crc32 = (arr: Uint8Array) => {
  let crc = 0 ^ (-1);
  for (let i = 0; i < arr.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ arr[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
};

export const changeDpiOnDataUrl = (dataUrl: string, dpi: number): string => {
  if (dpi <= 0) return dataUrl;

  const [header, base64] = dataUrl.split(',');
  const isPng = header.includes('image/png');
  const isJpeg = header.includes('image/jpeg');

  if (!isPng && !isJpeg) {
     return dataUrl; // Unmodified for GIF or others
  }

  const binaryString = atob(base64);
  const data = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    data[i] = binaryString.charCodeAt(i);
  }

  if (isPng) {
    return header + ',' + btoa(processPng(data, dpi));
  } else if (isJpeg) {
    return header + ',' + btoa(processJpeg(data, dpi));
  }
  
  return dataUrl;
};

const processPng = (data: Uint8Array, dpi: number): string => {
  // 1 inch = 0.0254 meters. Pixels per meter = dpi / 0.0254
  const ppm = Math.round(dpi / 0.0254);
  
  // Find IHDR chunk (always first, starts at index 8)
  // PNG Magic: 137 80 78 71 13 10 26 10
  // IHDR Length: 13 (so chunk is 4 + 4 + 13 + 4 = 25 bytes)
  let offset = 8;
  const length = (data[offset] << 24) | (data[offset+1] << 16) | (data[offset+2] << 8) | data[offset+3];
  offset += 4;
  
  const type = String.fromCharCode(data[offset], data[offset+1], data[offset+2], data[offset+3]);
  offset += 4;
  
  // Skip over IHDR data and CRC
  offset += length + 4;

  const chunks = [];
  // Add magic + IHDR
  chunks.push(data.slice(0, offset));
  
  // Check if next chunk is already pHYs. If so, skip it.
  const nextLength = (data[offset] << 24) | (data[offset+1] << 16) | (data[offset+2] << 8) | data[offset+3];
  const nextType = String.fromCharCode(data[offset+4], data[offset+5], data[offset+6], data[offset+7]);
  
  let skipLength = 0;
  if (nextType === 'pHYs') {
    skipLength = 4 + 4 + nextLength + 4; 
  }
  
  // Create our pHYs chunk
  const phys = new Uint8Array(21);
  // Length (9)
  phys[0] = 0; phys[1] = 0; phys[2] = 0; phys[3] = 9;
  // Type: pHYs
  phys[4] = 112; phys[5] = 72; phys[6] = 89; phys[7] = 115;
  // X axis
  phys[8] = (ppm >>> 24) & 0xFF; phys[9] = (ppm >>> 16) & 0xFF; phys[10] = (ppm >>> 8) & 0xFF; phys[11] = ppm & 0xFF;
  // Y axis
  phys[12] = (ppm >>> 24) & 0xFF; phys[13] = (ppm >>> 16) & 0xFF; phys[14] = (ppm >>> 8) & 0xFF; phys[15] = ppm & 0xFF;
  // Unit (1 = meter)
  phys[16] = 1;
  // CRC
  const crc = crc32(phys.slice(4, 17));
  phys[17] = (crc >>> 24) & 0xFF; phys[18] = (crc >>> 16) & 0xFF; phys[19] = (crc >>> 8) & 0xFF; phys[20] = crc & 0xFF;

  chunks.push(phys);
  chunks.push(data.slice(offset + skipLength));
  
  // Combine
  const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
  const out = new Uint8Array(totalLength);
  let cur = 0;
  for (const c of chunks) {
    out.set(c, cur);
    cur += c.length;
  }
  
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < out.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, out.subarray(i, i + chunkSize) as unknown as number[]);
  }
  return binary;
};

const processJpeg = (data: Uint8Array, dpi: number): string => {
  // Just rewrite APP0 marker
  // JPEG format: FF D8 (SOI) followed by FF E0 (APP0)
  // Find APP0
  if (data[0] === 0xFF && data[1] === 0xD8 && data[2] === 0xFF && data[3] === 0xE0) {
    data[13] = 1; // 1 = dots per inch
    data[14] = (dpi >>> 8) & 0xFF;
    data[15] = dpi & 0xFF;
    data[16] = (dpi >>> 8) & 0xFF;
    data[17] = dpi & 0xFF;
  }
  
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < data.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, data.subarray(i, i + chunkSize) as unknown as number[]);
  }
  return binary;
};
