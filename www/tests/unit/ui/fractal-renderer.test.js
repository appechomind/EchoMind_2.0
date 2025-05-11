import FractalRenderer from '../../../src/core/ui/fractal-renderer';
import * as THREE from 'three';

jest.mock('three');

describe('Fractal Renderer', () => {
  let container;
  let renderer;

  beforeEach(() => {
    // Setup DOM element
    container = document.createElement('div');
    document.body.appendChild(container);

    // Mock Three.js classes
    THREE.Scene.mockClear();
    THREE.PerspectiveCamera.mockClear();
    THREE.WebGLRenderer.mockClear();
    THREE.Clock.mockClear();
    THREE.BufferGeometry.mockClear();
    THREE.Float32BufferAttribute.mockClear();
    THREE.PointsMaterial.mockClear();
    THREE.Points.mockClear();
    THREE.Color.mockClear();

    // Create renderer instance
    renderer = new FractalRenderer(container);
  });

  afterEach(() => {
    if (renderer) {
      renderer.destroy();
    }
    document.body.removeChild(container);
  });

  describe('initialization', () => {
    it('should create Three.js instances', () => {
      expect(THREE.Scene).toHaveBeenCalled();
      expect(THREE.PerspectiveCamera).toHaveBeenCalled();
      expect(THREE.WebGLRenderer).toHaveBeenCalled();
      expect(THREE.Clock).toHaveBeenCalled();
    });

    it('should set default options', () => {
      expect(renderer.options).toEqual({
        color: '#a96eff',
        speed: 0.01,
        complexity: 60,
        scale: 1.0
      });
    });

    it('should accept custom options', () => {
      const customOptions = {
        color: '#ff0000',
        speed: 0.02,
        complexity: 30,
        scale: 2.0
      };
      const customRenderer = new FractalRenderer(container, customOptions);
      expect(customRenderer.options).toEqual(customOptions);
    });
  });

  describe('particle creation', () => {
    it('should create particles with correct attributes', () => {
      expect(THREE.BufferGeometry).toHaveBeenCalled();
      expect(THREE.Float32BufferAttribute).toHaveBeenCalledTimes(2); // Position and color
      expect(THREE.PointsMaterial).toHaveBeenCalled();
      expect(THREE.Points).toHaveBeenCalled();
    });

    it('should create correct number of particles', () => {
      const geometry = renderer.particles.geometry;
      const positions = geometry.attributes.position.array;
      const colors = geometry.attributes.color.array;

      expect(positions.length).toBe(30000); // 10000 particles * 3 coordinates
      expect(colors.length).toBe(30000); // 10000 particles * 3 color components
    });
  });

  describe('animation', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should start animation on init', () => {
      expect(renderer.animationFrameId).not.toBeNull();
    });

    it('should update particle positions', () => {
      const initialPositions = [...renderer.particles.geometry.attributes.position.array];
      renderer.animate();
      const newPositions = renderer.particles.geometry.attributes.position.array;

      expect(newPositions).not.toEqual(initialPositions);
    });

    it('should update particle colors', () => {
      const initialColors = [...renderer.particles.geometry.attributes.color.array];
      renderer.animate();
      const newColors = renderer.particles.geometry.attributes.color.array;

      expect(newColors).not.toEqual(initialColors);
    });
  });

  describe('window resize handling', () => {
    it('should update camera and renderer on resize', () => {
      const updateProjectionMatrixSpy = jest.spyOn(renderer.camera, 'updateProjectionMatrix');
      const setRenderSizeSpy = jest.spyOn(renderer.renderer, 'setSize');

      window.innerWidth = 1024;
      window.innerHeight = 768;
      renderer.onWindowResize();

      expect(renderer.camera.aspect).toBe(1024 / 768);
      expect(updateProjectionMatrixSpy).toHaveBeenCalled();
      expect(setRenderSizeSpy).toHaveBeenCalledWith(1024, 768);
    });
  });

  describe('options update', () => {
    it('should update options', () => {
      const newOptions = {
        color: '#ff0000',
        speed: 0.05
      };
      renderer.updateOptions(newOptions);

      expect(renderer.options.color).toBe('#ff0000');
      expect(renderer.options.speed).toBe(0.05);
      expect(renderer.options.complexity).toBe(60); // Unchanged
      expect(renderer.options.scale).toBe(1.0); // Unchanged
    });
  });

  describe('cleanup', () => {
    it('should clean up resources on destroy', () => {
      const disposeSpy = jest.spyOn(renderer.scene, 'dispose');
      const rendererDisposeSpy = jest.spyOn(renderer.renderer, 'dispose');

      renderer.destroy();

      expect(disposeSpy).toHaveBeenCalled();
      expect(rendererDisposeSpy).toHaveBeenCalled();
      expect(renderer.animationFrameId).toBeNull();
    });

    it('should remove event listeners on destroy', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      renderer.destroy();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      );
    });
  });
}); 