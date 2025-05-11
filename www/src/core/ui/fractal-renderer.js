import * as THREE from 'three';

class FractalRenderer {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      color: '#a96eff',
      speed: 0.01,
      complexity: 60,
      scale: 1.0,
      ...options
    };

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    this.particles = null;
    this.clock = new THREE.Clock();
    this.animationFrameId = null;

    this.init();
  }

  init() {
    // Setup renderer
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0);
    this.container.appendChild(this.renderer.domElement);

    // Setup camera
    this.camera.position.z = 5;

    // Create particles
    this.createParticles();

    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));

    // Start animation
    this.animate();
  }

  createParticles() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];
    const size = 10000;

    // Create particle positions and colors
    for (let i = 0; i < size; i++) {
      const x = (Math.random() - 0.5) * 10;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 10;
      vertices.push(x, y, z);

      // Create purple color with variations
      const color = new THREE.Color(this.options.color);
      color.offsetHSL(0, 0, (Math.random() - 0.5) * 0.2);
      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));

    const time = this.clock.getElapsedTime() * this.options.speed;

    // Update particle positions
    const positions = this.particles.geometry.attributes.position.array;
    const colors = this.particles.geometry.attributes.color.array;

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];

      // Create fractal-like movement
      const angle = Math.atan2(y, x) + time;
      const radius = Math.sqrt(x * x + y * y);
      const newX = Math.cos(angle) * radius;
      const newY = Math.sin(angle) * radius;
      const newZ = z + Math.sin(time + radius) * 0.1;

      positions[i] = newX;
      positions[i + 1] = newY;
      positions[i + 2] = newZ;

      // Update colors based on position
      const color = new THREE.Color(this.options.color);
      const hue = (Math.atan2(newY, newX) + Math.PI) / (Math.PI * 2);
      color.setHSL(hue, 0.8, 0.6);
      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    }

    this.particles.geometry.attributes.position.needsUpdate = true;
    this.particles.geometry.attributes.color.needsUpdate = true;

    // Rotate particles
    this.particles.rotation.x = time * 0.1;
    this.particles.rotation.y = time * 0.2;

    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    this.container.removeChild(this.renderer.domElement);
    this.scene.dispose();
    this.renderer.dispose();
  }
}

export default FractalRenderer; 