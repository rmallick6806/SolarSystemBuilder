import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import * as WHS from 'whs';
import * as THREE from 'three';
import { colors } from './colors.js';
import * as Lights from './lights.js';
import { star, planetShape1, planetShape2, planetShape3, planetShape4 } from './spaceObjects.js';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();

const radiusMin = 190, // Min radius of the planet belt.
  radiusMax = 300, // Max radius of the planet belt.
  particleCount = 1, // Ammount of planets.
  particleMinRadius = 20, // Min of planet radius.
  particleMaxRadius = 50, // Max of planet radius.
  asteroidMinRadius = 1,
  asteroidMaxRadius = 3,
  sunSize = 140; // Radius of sun

const space = new WHS.Group();
const orbitModule = new WHS.OrbitControlsModule();
const mouse = new WHS.VirtualMouseModule();
const camera = new WHS.PerspectiveCamera({
  position: new THREE.Vector3(0, 100, 400),
  far: 20000,
  fov: 75,
  near: 1
});
const app = new WHS.App([
  new WHS.ElementModule({
    container: document.getElementById('mainContainer')
  }),
  new WHS.SceneModule(),
  new WHS.DefineModule('camera', camera),
  new WHS.RenderingModule({
    bgColor: 0x2a3340,

    renderer: {
      antialias: true,
      shadowmap: {
        type: THREE.PCFSoftShadowMap
      }
    }
  }, {shadow: true}),
  orbitModule,
  new WHS.ResizeModule(),
  mouse
]);
const sun = star(sunSize, colors.sun);
const planets = new WHS.Group();
const dynamicGeometry = new WHS.DynamicGeometryModule();
const material = new THREE.MeshStandardMaterial({
  shading: THREE.FlatShading,
  emissive: 0x270000,
  roughness: 0.9
});

space.addTo(app);
space.rotation.z = Math.PI / 12;
sun.addTo(space);

Lights.DirectionalLight.addTo(app);
Lights.AmbientLight.addTo(app);

const s1 = new WHS.Dodecahedron({
  geometry: {
    buffer: true,
    radius: 10
  },

  modules: [
    dynamicGeometry
  ],

  material
});

const s2 = new WHS.Box({
  geometry: {
    buffer: true,
    width: 10,
    height: 10,
    depth: 10
  },

  modules: [
    dynamicGeometry
  ],

  material
});

const s3 = new WHS.Cylinder({
  geometry: {
    buffer: true,
    radiusTop: 0,
    radiusBottom: 10,
    height: 10
  },

  modules: [
    dynamicGeometry
  ],

  material
});

const s4 = new WHS.Sphere({
  geometry: {
    buffer: true,
    radius: 10
  },

  modules: [
    dynamicGeometry
  ],

  material
});

var asteroidAnimation;

// Materials.
const mat = [
  new THREE.MeshPhongMaterial({color: colors.green, shading: THREE.FlatShading}),
  new THREE.MeshPhongMaterial({color: colors.blue, shading: THREE.FlatShading}),
  new THREE.MeshPhongMaterial({color: colors.orange, shading: THREE.FlatShading}),
  new THREE.MeshPhongMaterial({color: colors.blue, shading: THREE.FlatShading})
];

for (let i = 0; i < particleCount; i++) {
  const particle = [s1, s1, s4, s1][Math.ceil(Math.random() * 3)].clone(),
    radius = particleMinRadius + Math.random() * (particleMaxRadius - particleMinRadius);

  particle.g_({
    radiusBottom: radius,
    radiusTop: 0,
    height: particle instanceof WHS.Cylinder ? radius * 2 : radius,
    width: radius,
    depth: radius,
    radius
  });

  particle.material = mat[Math.floor(4 * Math.random())]; // Set custom THREE.Material to mesh.

  // Particle data.
  particle.data = {
    distance: radiusMin + i * (radiusMax - radiusMin),
    angle: Math.random() * Math.PI * 2
  };

  // Set position & rotation.
  particle.position.x = Math.cos(particle.data.angle) * particle.data.distance;
  particle.position.z = Math.sin(particle.data.angle) * particle.data.distance;
  particle.position.y = -10 * Math.random() + 4;
  //
  particle.rotation.set(Math.PI * 2 * Math.random(), Math.PI * 2 * Math.random(), Math.PI * 2 * Math.random());

  mouse.track(particle);
  particle.on('click', () => {
    camera.position.set(particle.position.x + 10, particle.position.y + 10, particle.position.z);
    animation.stop();
  });

  const normalsHelper = new THREE.VertexNormalsHelper(particle.native);
  app.get('scene').add(normalsHelper);
  // Cone
  const scale = 5;
  const cone = new WHS.Cone({
    geometry: {
      radius: scale,
      height: scale*2
    },
    material: new THREE.MeshPhongMaterial({
      color: colors.green,
    }),
    position: [0, scale, 0]
  });
  const upVec = new THREE.Vector3(0, 1, 0);
  const sg = particle.geometry;
  sg.computeVertexNormals(); // compute normals for each vertex
  const face = sg.faces[0]; // the actual face
  const point = sg.vertices[face.a]; // selected vertice (can be a, b or c
  const pointNormal = face.vertexNormals[0]; // it's normal (a=0)
  const quat = new THREE.Quaternion().setFromUnitVectors(upVec, pointNormal);

  const group = new WHS.Group(cone); // = Object3D in Three.js
  group.position.copy(point);
  group.quaternion.copy(quat);
  group.addTo(particle);
  particle.addTo(planets);

  if (i === 3) {
    const asteroidBelt = new WHS.Group();
    asteroidBelt.addTo(particle);
    for (let i = 0; i < 300; i++) {
      const asteroidObj = [s1, s2, s3, s4][Math.ceil(Math.random() * 3)].clone(),
        radius = asteroidMinRadius + Math.random() * (asteroidMaxRadius - asteroidMinRadius);

      asteroidObj.g_({
        radiusBottom: radius,
        radiusTop: 0,
        height: asteroidObj instanceof WHS.Cylinder ? radius * 2 : radius,
        width: radius,
        depth: radius,
        radius
      });
      asteroidObj.material = mat[Math.floor(4 * Math.random())]; // Set custom THREE.Material to mesh.
      // Asteroid data.
      asteroidObj.data = {
        distance: radius + i/20 + 50,
        angle: Math.random() * Math.PI * 2
      };
      // Set position & rotation.
      asteroidObj.position.x = Math.cos(asteroidObj.data.angle) * asteroidObj.data.distance;
      asteroidObj.position.z = Math.sin(asteroidObj.data.angle) * asteroidObj.data.distance;
      asteroidObj.position.y = -10 * Math.random() + 4;

      asteroidObj.rotation.set(Math.PI * 2 * Math.random(), Math.PI * 2 * Math.random(), Math.PI * 2 * Math.random());
      asteroidObj.addTo(asteroidBelt);
    }
  }
}


planets.addTo(space);
// Asteroids Animation
// const asteroidBelt = new WHS.Group();
// asteroidBelt.addTo(planets);

// Animating rotating shapes around sun.
const particles = planets.children;
const animation = new WHS.Loop(() => {
  for (let i = 0, max = particles.length; i < max; i++) {
    const particle = particles[i];

    particle.data.angle += 0.009 / (particle.data.distance / radiusMax);

    particle.position.x = (Math.cos(particle.data.angle) * particle.data.distance);
    particle.position.z = (Math.sin(particle.data.angle) * particle.data.distance);

    // particle.rotation.x += (Math.PI / 60) / (i * 0.9);
    particle.rotation.y += (Math.PI / 60) / (i * 0.9);
  }

  sun.rotation.y += 0.005;
});

mouse.track(sun);
sun.on('click', () => {
  const newPlanet = new WHS.Tetrahedron({
    geometry: {
      radius: 20,
      detail: 2
    },

    material: new THREE.MeshStandardMaterial({
      color: colors.green,
      shading: THREE.FlatShading,
      roughness: 0.9,
      emissive: 0x270000
    })
  });
  newPlanet.position.x = 30;
  newPlanet.position.z = 30;
  newPlanet.position.y = 100;
  newPlanet.addTo(space);
});

app.addLoop(animation);
animation.start();

// orbitModule.controls.minPolarAngle = 0;
// orbitModule.controls.maxPolarAngle = 0;
orbitModule.controls.minDistance = 300;
orbitModule.controls.maxDistance = 1200;

// Start rendering.
app.start();
