import * as WHS from 'whs';
import * as THREE from 'three';
import { colors } from './colors.js';
import * as Lights from './lights.js';
import { star, planetShape1, planetShape2, planetShape3, planetShape4 } from './spaceObjects.js';
import _ from 'lodash';

import GeometryUtils from './GeometryUtils.js';


class SolarSystem {
  constructor() {
    this.properties = {};
    this.orbitModule = new WHS.OrbitControlsModule();
    this.mouse = new WHS.VirtualMouseModule();
    this.camera = new WHS.PerspectiveCamera({
      position: new THREE.Vector3(0, 100, 400),
      far: 20000,
      fov: 75,
      near: 1
    });

    this.app = new WHS.App([
      new WHS.ElementModule({
        container: document.getElementById('mainContainer')
      }),
      new WHS.SceneModule(),
      new WHS.DefineModule('camera', this.camera),
      new WHS.RenderingModule({
        bgColor: 0x2a3340,

        renderer: {
          antialias: true,
          shadowmap: {
            type: THREE.PCFSoftShadowMap
          }
        }
      }, {shadow: true}),
      this.orbitModule,
      new WHS.ResizeModule(),
      this.mouse
    ]);
    this.space = new WHS.Group();
    this.planets = new WHS.Group();
    this.dynamicGeometry = new WHS.DynamicGeometryModule();
    this.material = new THREE.MeshStandardMaterial({
      shading: THREE.FlatShading,
      emissive: 0x270000,
      roughness: 0.9
    });
    this.mat = [
      new THREE.MeshPhongMaterial({color: colors.green, shading: THREE.FlatShading}),
      new THREE.MeshPhongMaterial({color: colors.blue, shading: THREE.FlatShading}),
      new THREE.MeshPhongMaterial({color: colors.orange, shading: THREE.FlatShading}),
      new THREE.MeshPhongMaterial({color: colors.blue, shading: THREE.FlatShading})
    ];
    this.colorMat = {
      'green' : new THREE.MeshPhongMaterial({color: colors.green, shading: THREE.FlatShading}),
      'blue' : new THREE.MeshPhongMaterial({color: colors.blue, shading: THREE.FlatShading}),
      'orange' : new THREE.MeshPhongMaterial({color: colors.orange, shading: THREE.FlatShading}),
      'blue' : new THREE.MeshPhongMaterial({color: colors.blue, shading: THREE.FlatShading})
    };
    this.s1 = planetShape1(this.dynamicGeometry, this.material)
    this.s2 = planetShape2(this.dynamicGeometry, this.material)
    this.s3 = planetShape3(this.dynamicGeometry, this.material)
    this.s4 = planetShape4(this.dynamicGeometry, this.material)

    this.space.addTo(this.app);
    this.space.rotation.z = Math.PI / 12;
    this.planets.addTo(this.space);

    // LIGHTS.
    Lights.DirectionalLight.addTo(this.app);
    Lights.AmbientLight.addTo(this.app);
    // new WHS.PointLight( {
    //   color: 0xffffff,
    //   intensity: 10,
    //   distance: 20000,
    //   position: [100, 200, 200]
    // }).addTo(this.app);

  }

  setProperties(properties) {
    this.properties = properties
  }

  init() {
    this.sun = star(this.properties.sunSize, colors.sun);
    this.sun.addTo(this.space);

    const planetsArr = [];
    for (let i = 0; i < this.properties.planetCount; i++) {
      planetsArr.push(this.generatePlanet(i));
    }

    const asteroidBelt1 = this.generateAsteroidBelt(planetsArr[3]);
    const tree1 = this.addTreeToPlanet(planetsArr[0]);
    _.delay(() => this.addCityToPlanet(this.sun), 0);

    let lastPlanet = _.last(planetsArr);
    let lastPlanetDistance = lastPlanet.data.distance;

    this.generateSolarAsteroidBelt(this.sun, 3, 6, lastPlanetDistance + 100);

    // Animating rotating shapes around planet.
    this.animation = new WHS.Loop(() => {
      const planetObjs = this.planets.children;
      for (let i = 0, max = planetObjs.length; i < max; i++) {
        const planetObj = planetObjs[i];

        planetObj.data.angle += 0.009 / (planetObj.data.distance / this.properties.radiusMax);

        planetObj.position.x = (Math.cos(planetObj.data.angle) * planetObj.data.distance);
        planetObj.position.z = (Math.sin(planetObj.data.angle) * planetObj.data.distance);

        // planetObj.rotation.x += 1 / 60;
        planetObj.rotation.y += 2 / 30;
        if (this.asteroidBelt) {
          this.asteroidBelt.rotation.y += 2/500;
        }
      }
      this.sun.rotation.y -= 0.005;
    });

    this.app.addLoop(this.animation);
    this.animation.start();
    this.orbitModule.controls.minDistance = 90;
    this.orbitModule.controls.maxDistance = Infinity;



    // const path = './assets/demo1.json';
    // new WHS.Importer({
    //   loader: new THREE.JSONLoader(),
    //   url: path,
    //   geometry: {
    //       height: 10000*5,
    //       width: 10000*5,
    //       radius: 10000*5
    //     },
    //   parser(geometry, material) { // data from loader
    //     return new THREE.Mesh(geometry, material); // should return your .native (mesh in this case)
    //   },
    //   position: [0, 100, 0]
    // }).addTo(this.app);

    this.app.start()
  }

  generatePlanet(i) {
    const planet = [this.s1, this.s1, this.s4, this.s1][Math.ceil(Math.random() * 3)].clone(),
      radius = this.properties.planetMinRadius + Math.random() * (this.properties.planetMaxRadius - this.properties.planetMinRadius);

    planet.g_({
      radiusBottom: radius,
      radiusTop: 0,
      height: planet instanceof WHS.Cylinder ? radius * 2 : radius,
      width: radius,
      depth: radius,
      radius
    });

    planet.material = this.mat[Math.floor(4 * Math.random())]; // Set custom THREE.Material to mesh.

    // Planet data
    planet.data = {
      distance: this.properties.radiusMin + i * (this.properties.radiusMax - this.properties.radiusMin),
      angle: Math.random() * Math.PI * 2
    };

    // Set position & rotation.
    planet.position.x = Math.cos(planet.data.angle) * planet.data.distance;
    planet.position.z = Math.sin(planet.data.angle) * planet.data.distance;
    planet.position.y = -10 * Math.random() + 4;

    planet.rotation.set(Math.PI * 2 * Math.random(), Math.PI * 2 * Math.random(), Math.PI * 2 * Math.random());

    this.mouse.track(planet);
    planet.on('click', () => {
      this.camera.position.set(planet.position.x + 10, planet.position.y, planet.position.z);
      this.animation.stop();
    });
    planet.addTo(this.planets);
    return planet;
  }

  generateAsteroidBelt(planet, extraDistance = 0, forceColor) {
    this.asteroidBelt = new WHS.Group();
    this.asteroidBelt.addTo(planet);
    for (let i = 0; i < 300; i++) {
      const asteroidObj = [this.s1, this.s2, this.s3, this.s4][Math.ceil(Math.random() * 3)].clone();
      const radius = this.properties.asteroidMinRadius + Math.random() * (this.properties.asteroidMaxRadius - this.properties.asteroidMinRadius);

      asteroidObj.g_({
        radiusBottom: radius,
        radiusTop: 0,
        height: asteroidObj instanceof WHS.Cylinder ? radius * 2 : radius,
        width: radius,
        depth: radius,
        radius
      });

      if (forceColor) {
        asteroidObj.material = this.colorMat[forceColor];
      } else {
        asteroidObj.material = this.mat[Math.floor(4 * Math.random())]; // Set custom THREE.Material to mesh.
      }

      // Asteroid data.
      asteroidObj.data = {
        distance: radius + i/20 + 100 + extraDistance,
        angle: Math.random() * Math.PI * 2
      };
      // Set position & rotation.
      asteroidObj.position.x = Math.cos(asteroidObj.data.angle) * asteroidObj.data.distance;
      asteroidObj.position.z = Math.sin(asteroidObj.data.angle) * asteroidObj.data.distance;
      asteroidObj.position.y = -10 * Math.random() + 4;

      asteroidObj.rotation.set(Math.PI * 2 * Math.random(), Math.PI * 2 * Math.random(), Math.PI * 2 * Math.random());
      asteroidObj.addTo(this.asteroidBelt);
    }
  }

  generateSolarAsteroidBelt(sun, radiusMin, radiusMax, outerRadius) {
    this.solarAsteroidBelt = new WHS.Group();
    this.solarAsteroidBelt.addTo(sun);
    for (let i = 0; i < 300; i++) {
      const asteroidObj = [this.s1, this.s2, this.s3, this.s4][Math.ceil(Math.random() * 3)].clone();
      const radius = radiusMin + Math.random() * (radiusMax - radiusMin);

      asteroidObj.g_({
        radiusBottom: radius,
        radiusTop: 0,
        height: asteroidObj instanceof WHS.Cylinder ? radius * 2 : radius,
        width: radius,
        depth: radius,
        radius
      });
      asteroidObj.material = this.mat[Math.floor(4 * Math.random())]; // Set custom THREE.Material to mesh.
      // Asteroid data.
      asteroidObj.data = {
        distance: radius + i/2 + outerRadius,
        angle: Math.random() * Math.PI * 2
      };
      // Set position & rotation.
      asteroidObj.position.x = -Math.cos(asteroidObj.data.angle) * asteroidObj.data.distance;
      asteroidObj.position.z = Math.sin(asteroidObj.data.angle) * asteroidObj.data.distance;
      asteroidObj.position.y = -10 * Math.random() + 4;

      // asteroidObj.rotation.set(-Math.PI * 2 * Math.random(), Math.PI * 2 * Math.random(), Math.PI * 2 * Math.random());
      asteroidObj.addTo(this.solarAsteroidBelt);
    }
  }

  addTreeToPlanet(planet) {
    const normalsHelper = new THREE.VertexNormalsHelper(planet.native);
    this.app.get('scene').add(normalsHelper);
    // Cone
    const scale = 5;
    const cone = new WHS.Cone({
      geometry: {
        radius: scale,
        height: scale * 2
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

  addCityToPlanet(planet) {
    const normalsHelper = new THREE.VertexNormalsHelper(planet.native);
    this.app.get('scene').add(normalsHelper);
    // Cone
    const scale = 2;
    const cube = new WHS.Box({
      geometry: {
        height: scale * 4,
        width: scale * 2,
        depth: scale * 2
      },

      material: new THREE.MeshPhongMaterial({
        color: colors.green,
      }),
      position: [0, scale, 0]
    });
    const cube2 = new WHS.Box({
      geometry: {
        height: scale * 10,
        width: scale * 2,
        depth: scale * 20
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

    const randomSpherePoint = function(x0,y0,z0,radius){
     var u = Math.random();
     var v = Math.random();
     var theta = 2 * Math.PI * u;
     var phi = Math.acos(2 * v - 1);
     var x = x0 + (radius * Math.sin(phi) * Math.cos(theta));
     var y = y0 + (radius * Math.sin(phi) * Math.sin(theta));
     var z = z0 + (radius * Math.cos(phi));
     return new THREE.Vector3(x,y,z);
    };

    let newerPoint = randomSpherePoint(sg.boundingSphere.center.x, sg.boundingSphere.center.y, sg.boundingSphere.center.z, sg.boundingSphere.radius)

    let newestPoint = GeometryUtils.randomPointsInGeometry(sg, 2);
    console.log(newestPoint[0]);
    const group = new WHS.Group(cube); // = Object3D in Three.js
    group.position.copy(newestPoint[0]);
    group.quaternion.copy(quat);
    group.addTo(planet);
  }

  generateCrazyPlanet() {
    this.app.remove(this.space);
    this.space = new WHS.Group();
    this.space.addTo(this.app);
    this.sun = star(this.properties.sunSize, this.properties.sunColor);
    this.sun.addTo(this.space);

    // this.space.remove(this.planets);
    this.planets = new WHS.Group();
    this.planets.addTo(this.space);

    for (let i = 0; i < this.properties.planetCount; i++) {
      this.properties.planetsArr[i].addTo(this.planets);
    }

    this.generateAsteroidBelt(this.properties.planetsArr[3]);
    this.generateAsteroidBelt(this.properties.planetsArr[3], 30, 'blue');
    this.addCityToPlanet(this.properties.planetsArr[3]);

    let lastPlanet = _.last(this.properties.planetsArr);
    let lastPlanetDistance = lastPlanet.data.distance;

    this.generateSolarAsteroidBelt(this.sun, 3, 6, lastPlanetDistance + 100);
    this.animation.start();
  }

  clearSolarSystem() {
    this.space.remove(this.planets);
    this.app.remove(this.space);
  }
}

export default SolarSystem;
