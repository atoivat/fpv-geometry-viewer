import { describe, it, expect } from 'vitest';
import { EDLShader } from '../EDLPass';

describe('EDLShader', () => {
  it('should define valid uniforms, vertexShader, and fragmentShader for Eye-Dome Lighting', () => {
    expect(EDLShader.uniforms).toBeDefined();
    expect(EDLShader.uniforms.tDiffuse).toBeDefined();
    expect(EDLShader.uniforms.tDepth).toBeDefined();
    expect(EDLShader.uniforms.cameraNear).toBeDefined();
    expect(EDLShader.uniforms.cameraFar).toBeDefined();
    expect(EDLShader.vertexShader).toContain('varying vec2 vUv;');
    expect(EDLShader.fragmentShader).toContain('readLinearDepth');
  });
});
