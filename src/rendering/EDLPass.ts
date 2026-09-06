import * as THREE from 'three';

export const EDLShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    tDepth: { value: null as THREE.Texture | null },
    resolution: { value: new THREE.Vector2(1, 1) },
    cameraNear: { value: 0.1 },
    cameraFar: { value: 1000.0 },
    radius: { value: 1.5 },
    strength: { value: 0.6 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform sampler2D tDepth;
    uniform vec2 resolution;
    uniform float cameraNear;
    uniform float cameraFar;
    uniform float radius;
    uniform float strength;

    varying vec2 vUv;

    float readLinearDepth(vec2 coord) {
      float fragDepth = texture2D(tDepth, coord).x;
      float z = fragDepth * 2.0 - 1.0;
      return (2.0 * cameraNear * cameraFar) / (cameraFar + cameraNear - z * (cameraFar - cameraNear));
    }

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      float d = readLinearDepth(vUv);

      // Skip background pixels
      if (d >= cameraFar * 0.98) {
        gl_FragColor = color;
        return;
      }

      vec2 texelSize = 1.0 / resolution;
      float maxOcclusion = 0.0;
      float maxHighlight = 0.0;
      float validCount = 0.0;

      // 8-neighbor sample pattern (4 orthogonal + 4 diagonal)
      vec2 offsets[8];
      offsets[0] = vec2( 1.0,  0.0);
      offsets[1] = vec2(-1.0,  0.0);
      offsets[2] = vec2( 0.0,  1.0);
      offsets[3] = vec2( 0.0, -1.0);
      offsets[4] = vec2( 0.707,  0.707);
      offsets[5] = vec2(-0.707,  0.707);
      offsets[6] = vec2( 0.707, -0.707);
      offsets[7] = vec2(-0.707, -0.707);

      for (int i = 0; i < 8; i++) {
        vec2 sampleUv = vUv + offsets[i] * texelSize * radius;
        float dn = readLinearDepth(sampleUv);

        // Ignore background samples
        if (dn < cameraFar * 0.98) {
          float diff = log2(d) - log2(dn);
          if (diff > 0.0) {
            // Neighbor is closer: center pixel is occluded -> darken
            maxOcclusion = max(maxOcclusion, diff);
          } else if (diff < 0.0) {
            // Neighbor is further: center pixel is silhouette edge -> highlight
            maxHighlight = max(maxHighlight, -diff);
          }
          validCount += 1.0;
        }
      }

      if (validCount == 0.0) {
        gl_FragColor = color;
        return;
      }

      // Compute shading multiplier with contrast curve
      float shadowFactor = exp(-maxOcclusion * strength * 120.0);
      float highlightFactor = 1.0 + (1.0 - exp(-maxHighlight * strength * 60.0)) * 0.35;

      shadowFactor = clamp(shadowFactor, 0.25, 1.0);

      vec3 finalColor = color.rgb * shadowFactor * highlightFactor;
      gl_FragColor = vec4(finalColor, color.a);
    }
  `,
};
