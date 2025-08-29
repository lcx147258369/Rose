import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './App.css';

function App() {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222); // Deep grey color

    // Camera
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(renderer.domElement);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5; 

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Load Model
    const loader = new GLTFLoader();
    let model;
    loader.load(
      '/rose.glb', // Path to your model
      (gltf) => {
        model = gltf.scene;

        // Center and scale the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Scale model to fit within a 2x2x2 box
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 4.0 / maxDim;
        model.scale.set(scale, scale, scale);

        // Reposition model to the center
        model.position.sub(center.multiplyScalar(scale));
        
        scene.add(model);
        createParticles(); // Create particles after model is loaded
      },
      undefined,
      (error) => {
        console.error(error);
      }
    );

    // Particles
    let particles, particleMaterial;
    const particleCount = 4000;
    const positions = new Float32Array(particleCount * 5);

    function createParticles() {
        const geometry = new THREE.BufferGeometry();
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 0.5;
            const radius = 0.5 + Math.random() * 2; // Radius around the model
            const theta = THREE.MathUtils.randFloatSpread(360); 
            const phi = THREE.MathUtils.randFloatSpread(360); 

            positions[i3] = radius * Math.sin(theta) * Math.cos(phi);
            positions[i3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
            positions[i3 + 2] = radius * Math.cos(theta);
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        particleMaterial = new THREE.PointsMaterial({
            color: 0xd543f6,
            size: 0.02,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true,
        });

        particles = new THREE.Points(geometry, particleMaterial);
        scene.add(particles);
    }


    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (particles) {
        particles.rotation.y += 0.001;
        const time = Date.now() * 0.0005;
        particleMaterial.opacity = Math.sin(time * 5.0) * 0.5 + 0.5;
      }
      
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      currentMount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />
  );
}

export default App;
