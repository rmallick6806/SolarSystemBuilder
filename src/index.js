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
  planetCount = 9, // Ammount of planets.
  planetMinRadius = 20, // Min of planet radius.
  planetMaxRadius = 50, // Max of planet radius.
  asteroidMinRadius = 1,
  asteroidMaxRadius = 3,
  sunSize = 140; // Radius of sun

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
const space = new WHS.Group();
const planets = new WHS.Group();
const sun = star(sunSize, colors.sun);
const dynamicGeometry = new WHS.DynamicGeometryModule();
const material = new THREE.MeshStandardMaterial({
  shading: THREE.FlatShading,
  emissive: 0x270000,
  roughness: 0.9
});
const mat = [
  new THREE.MeshPhongMaterial({color: colors.green, shading: THREE.FlatShading}),
  new THREE.MeshPhongMaterial({color: colors.blue, shading: THREE.FlatShading}),
  new THREE.MeshPhongMaterial({color: colors.orange, shading: THREE.FlatShading}),
  new THREE.MeshPhongMaterial({color: colors.blue, shading: THREE.FlatShading})
];
const s1 = planetShape1(dynamicGeometry, material)
const s2 = planetShape2(dynamicGeometry, material)
const s3 = planetShape3(dynamicGeometry, material)
const s4 = planetShape4(dynamicGeometry, material)

space.addTo(app);
space.rotation.z = Math.PI / 12;
sun.addTo(space);
planets.addTo(space);

// LIGHTS.
Lights.DirectionalLight.addTo(app);
Lights.AmbientLight.addTo(app);

const generatePlanet = function(i) {
  const planet = [s1, s1, s4, s1][Math.ceil(Math.random() * 3)].clone(),
    radius = planetMinRadius + Math.random() * (planetMaxRadius - planetMinRadius);

  planet.g_({
    radiusBottom: radius,
    radiusTop: 0,
    height: planet instanceof WHS.Cylinder ? radius * 2 : radius,
    width: radius,
    depth: radius,
    radius
  });

  planet.material = mat[Math.floor(4 * Math.random())]; // Set custom THREE.Material to mesh.

  // Particle data.
  planet.data = {
    distance: radiusMin + i * (radiusMax - radiusMin),
    angle: Math.random() * Math.PI * 2
  };

  // Set position & rotation.
  planet.position.x = Math.cos(planet.data.angle) * planet.data.distance;
  planet.position.z = Math.sin(planet.data.angle) * planet.data.distance;
  planet.position.y = -10 * Math.random() + 4;

  planet.rotation.set(Math.PI * 2 * Math.random(), Math.PI * 2 * Math.random(), Math.PI * 2 * Math.random());

  mouse.track(planet);
  planet.on('click', () => {
    camera.position.set(planet.position.x + 10, planet.position.y, planet.position.z);
    animation.stop();
  });
  planet.addTo(planets);
  return planet;
}

const generateAsteroidBelt = function(planet) {
  const asteroidBelt = new WHS.Group();
  asteroidBelt.addTo(planet);
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

const addTreeToPlanet = function(planet) {
  const normalsHelper = new THREE.VertexNormalsHelper(planet.native);
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
  const sg = planet.geometry;
  sg.computeVertexNormals(); // compute normals for each vertex
  const face = sg.faces[0]; // the actual face
  const point = sg.vertices[face.a]; // selected vertice (can be a, b or c)
  const pointNormal = face.vertexNormals[0]; // it's normal (a=0)
  const quat = new THREE.Quaternion().setFromUnitVectors(upVec, pointNormal);

  const group = new WHS.Group(cone); // = Object3D in Three.js
  group.position.copy(point);
  group.quaternion.copy(quat);
  group.addTo(planet);
}

const planetsArr = [];
for (let i = 0; i < planetCount; i++) {
  planetsArr.push(generatePlanet(i));
  // generateAsteroidBelt(planetsArr[i]);
}

const asteroidBelt1 = generateAsteroidBelt(planetsArr[0]);
const tree1 = addTreeToPlanet(planetsArr[0]);
const planetObjs = planets.children;

// Animating rotating shapes around planet.
const animation = new WHS.Loop(() => {
  for (let i = 0, max = planetObjs.length; i < max; i++) {
    const planetObj = planetObjs[i];

    planetObj.data.angle += 0.009 / (planetObj.data.distance / radiusMax);

    planetObj.position.x = (Math.cos(planetObj.data.angle) * planetObj.data.distance);
    planetObj.position.z = (Math.sin(planetObj.data.angle) * planetObj.data.distance);

    planetObj.rotation.x += Math.PI / 60;
    planetObj.rotation.y += Math.PI / 60;
  }
  sun.rotation.y += 0.005;
});

app.addLoop(animation);
animation.start();
orbitModule.controls.minDistance = 900;
orbitModule.controls.maxDistance = 1200;

// Start rendering.
app.start();
