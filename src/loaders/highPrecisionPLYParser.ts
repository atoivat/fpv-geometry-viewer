import * as THREE from 'three';
import { OffsetMetadata } from './coordinateCentering';

export interface HighPrecisionPLYResult {
  geometry: THREE.BufferGeometry;
  offset: OffsetMetadata;
  isMesh: boolean;
}

/**
 * Parses PLY ArrayBuffer with 64-bit floating-point precision for vertex coordinates (x, y, z).
 * Computes bounding box centroid in 64-bit precision and translates vertices relative to centroid
 * BEFORE creating 32-bit Float32BufferAttribute, preventing WebGL floating-point quantization jitter.
 */
export function parsePLYHighPrecision(buffer: ArrayBuffer): HighPrecisionPLYResult {
  const textDecoder = new TextDecoder('utf-8');
  const headerBytes = new Uint8Array(buffer, 0, Math.min(buffer.byteLength, 8192));
  const headerText = textDecoder.decode(headerBytes);

  const endHeaderMatch = headerText.match(/end_header[\r\n]+/);
  if (!endHeaderMatch || endHeaderMatch.index === undefined) {
    throw new Error('Invalid PLY file: end_header not found');
  }

  const endHeaderPos = endHeaderMatch.index + endHeaderMatch[0].length;
  const headerString = headerText.substring(0, endHeaderMatch.index);
  const lines = headerString.split(/\r?\n/);

  let format: 'ascii' | 'binary_little_endian' | 'binary_big_endian' = 'ascii';
  let vertexCount = 0;
  let faceCount = 0;
  let inVertexElement = false;

  interface PropertyDesc {
    name: string;
    type: string;
  }
  const vertexProps: PropertyDesc[] = [];

  for (const line of lines) {
    const tokens = line.trim().split(/\s+/);
    if (tokens[0] === 'format') {
      if (tokens[1] === 'ascii') format = 'ascii';
      else if (tokens[1] === 'binary_little_endian') format = 'binary_little_endian';
      else if (tokens[1] === 'binary_big_endian') format = 'binary_big_endian';
    } else if (tokens[0] === 'element') {
      if (tokens[1] === 'vertex') {
        inVertexElement = true;
        vertexCount = parseInt(tokens[2], 10);
      } else if (tokens[1] === 'face') {
        inVertexElement = false;
        faceCount = parseInt(tokens[2], 10);
      } else {
        inVertexElement = false;
      }
    } else if (tokens[0] === 'property' && inVertexElement) {
      vertexProps.push({ name: tokens[2], type: tokens[1] });
    }
  }

  const xIdx = vertexProps.findIndex((p) => p.name === 'x');
  const yIdx = vertexProps.findIndex((p) => p.name === 'y');
  const zIdx = vertexProps.findIndex((p) => p.name === 'z');

  const rIdx = vertexProps.findIndex((p) => p.name === 'red' || p.name === 'r');
  const gIdx = vertexProps.findIndex((p) => p.name === 'green' || p.name === 'g');
  const bIdx = vertexProps.findIndex((p) => p.name === 'blue' || p.name === 'b');

  if (xIdx === -1 || yIdx === -1 || zIdx === -1) {
    throw new Error('PLY file missing vertex position x, y, or z properties');
  }

  const rawX = new Float64Array(vertexCount);
  const rawY = new Float64Array(vertexCount);
  const rawZ = new Float64Array(vertexCount);

  const hasColor = rIdx !== -1 && gIdx !== -1 && bIdx !== -1;
  const colors = hasColor ? new Float32Array(vertexCount * 3) : null;

  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

  if (format === 'ascii') {
    const fullText = textDecoder.decode(buffer);
    const bodyText = fullText.substring(endHeaderPos).trim();
    const tokens = bodyText.split(/\s+/);
    let tokenIdx = 0;
    const propCount = vertexProps.length;

    for (let i = 0; i < vertexCount; i++) {
      for (let p = 0; p < propCount; p++) {
        const val = parseFloat(tokens[tokenIdx++]);
        if (p === xIdx) rawX[i] = val;
        else if (p === yIdx) rawY[i] = val;
        else if (p === zIdx) rawZ[i] = val;

        if (hasColor) {
          if (p === rIdx) colors![i * 3] = val > 1 ? val / 255 : val;
          else if (p === gIdx) colors![i * 3 + 1] = val > 1 ? val / 255 : val;
          else if (p === bIdx) colors![i * 3 + 2] = val > 1 ? val / 255 : val;
        }
      }

      const x = rawX[i];
      const y = rawY[i];
      const z = rawZ[i];

      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    }
  } else {
    const littleEndian = format === 'binary_little_endian';
    const view = new DataView(buffer, endHeaderPos);
    let byteOffset = 0;

    const readValue = (type: string): number => {
      let val = 0;
      if (type === 'float' || type === 'float32') {
        val = view.getFloat32(byteOffset, littleEndian);
        byteOffset += 4;
      } else if (type === 'double' || type === 'float64') {
        val = view.getFloat64(byteOffset, littleEndian);
        byteOffset += 8;
      } else if (type === 'uchar' || type === 'uint8') {
        val = view.getUint8(byteOffset);
        byteOffset += 1;
      } else if (type === 'char' || type === 'int8') {
        val = view.getInt8(byteOffset);
        byteOffset += 1;
      } else if (type === 'short' || type === 'int16') {
        val = view.getInt16(byteOffset, littleEndian);
        byteOffset += 2;
      } else if (type === 'ushort' || type === 'uint16') {
        val = view.getUint16(byteOffset, littleEndian);
        byteOffset += 2;
      } else if (type === 'int' || type === 'int32') {
        val = view.getInt32(byteOffset, littleEndian);
        byteOffset += 4;
      } else if (type === 'uint' || type === 'uint32') {
        val = view.getUint32(byteOffset, littleEndian);
        byteOffset += 4;
      } else {
        byteOffset += 4;
      }
      return val;
    };

    const propCount = vertexProps.length;
    for (let i = 0; i < vertexCount; i++) {
      for (let p = 0; p < propCount; p++) {
        const prop = vertexProps[p];
        const val = readValue(prop.type);
        if (p === xIdx) rawX[i] = val;
        else if (p === yIdx) rawY[i] = val;
        else if (p === zIdx) rawZ[i] = val;

        if (hasColor) {
          if (p === rIdx) colors![i * 3] = val > 1 ? val / 255 : val;
          else if (p === gIdx) colors![i * 3 + 1] = val > 1 ? val / 255 : val;
          else if (p === bIdx) colors![i * 3 + 2] = val > 1 ? val / 255 : val;
        }
      }

      const x = rawX[i];
      const y = rawY[i];
      const z = rawZ[i];

      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    }
  }

  // Calculate 64-bit double precision centroid offset
  const centroidX = (minX + maxX) / 2;
  const centroidY = (minY + maxY) / 2;
  const centroidZ = (minZ + maxZ) / 2;

  // Build centered 32-bit Float32Array relative to 64-bit centroid
  const positions = new Float32Array(vertexCount * 3);
  for (let i = 0; i < vertexCount; i++) {
    positions[i * 3] = rawX[i] - centroidX;
    positions[i * 3 + 1] = rawY[i] - centroidY;
    positions[i * 3 + 2] = rawZ[i] - centroidZ;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  if (colors) {
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  }

  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  return {
    geometry,
    offset: {
      x: centroidX,
      y: centroidY,
      z: centroidZ,
    },
    isMesh: faceCount > 0,
  };
}
