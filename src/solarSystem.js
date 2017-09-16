import * as WHS from 'whs';
import * as THREE from 'three';
import { colors } from './colors.js';
import * as Lights from './lights.js';
import { star, planetShape1, planetShape2, planetShape3, planetShape4, homePlanet, landMass } from './spaceObjects.js';
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
        // bgColor: 0x2a3340,
        bgOpacity: 0,
        renderer: {
          alpha: true,
          antialias: true,
          shadowmap: {
            type: THREE.PCFSoftShadowMap
          }
        }
      }, {shadow: true}),
      this.orbitModule,
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
      'purple' : new THREE.MeshPhongMaterial({color: new THREE.Color('#45285B'), shading: THREE.FlatShading}),
      'sun' : new THREE.MeshPhongMaterial({color: colors.sun, shading: THREE.FlatShading})
    };
    this.s1 = planetShape1(this.dynamicGeometry, this.material)
    this.s2 = planetShape2(this.dynamicGeometry, this.material)
    this.s3 = planetShape3(this.dynamicGeometry, this.material)
    this.s4 = planetShape4(this.dynamicGeometry, this.material)
    this.homePlanetShape = homePlanet(this.dynamicGeometry, this.material)
    this.landMassShape = landMass(this.dynamicGeometry, this.material);

    this.space.addTo(this.app);
    this.space.rotation.z = Math.PI / 12;
    this.planets.addTo(this.space);

    // LIGHTS.
    Lights.DirectionalLight.addTo(this.app);
    Lights.AmbientLight.addTo(this.app);
    // this.sunLight = new WHS.PointLight( {
    //   color: 0xffffff,
    //   intensity: 7,
    //   distance: 20000,
    //   position: [100, 200, 200]
    // });
    //
    // this.sunLight2 = new WHS.PointLight( {
    //   color: 0xffffff,
    //   intensity: 7,
    //   distance: 20000,
    //   position: [-200, -100, 0]
    // });
    //
    // this.sunLight.addTo(this.app);
    // this.sunLight2.addTo(this.app);

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
    const moon = this.generateMoon(planetsArr[1], false, 0);
    const moon2 = this.generateMoon(planetsArr[1], false, 20);

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

        if (this.moons) {
          this.moons.rotation.x += 2/500;
        }
        // this.camera.position.set(planetObjs[3].position.x + 200, planetObjs[3].position.y + 200, planetObjs[3].position.z + 200);
      }

      this.sun.rotation.y -= 0.005;
    });

    this.cameraAnimation = new WHS.Loop(() => {
      this.camera.position.set(planetsArr[3].position.x + 300 , planetsArr[3].position.y + 300, planetsArr[3].position.z + 300);
    });

    this.app.addLoop(this.animation);
    this.animation.start();
    this.app.addLoop(this.cameraAnimation);
    this.cameraAnimation.start();
    this.orbitModule.controls.minDistance = 90;
    this.orbitModule.controls.maxDistance = Infinity;

    // const path = './assets/blenderTree.obj';
    // new WHS.Importer({
    //   loader: new THREE.ObjectLoader(),
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

  generatePlanet(i, homePlanet) {
    let self = this;
    let shapeDecider = {
      'Tetrahedron': self.s1,
      'Dodecahedron': self.s2,
      'Diamond': self.s3,
      'Sphere': self.s4
    };
    let shapePicker = _.sample(['Tetrahedron', 'Dodecahedron', 'Diamond', 'Sphere']);
    let planet = shapeDecider[shapePicker].clone();
    const radius = this.properties.planetMinRadius + Math.random() * (this.properties.planetMaxRadius - this.properties.planetMinRadius);

    if (homePlanet) {
      planet = this.homePlanetShape.clone();
    };

    planet.g_({
      radiusBottom: radius,
      radiusTop: 0,
      height: planet instanceof WHS.Cylinder ? radius * 2 : radius,
      width: radius,
      depth: radius,
      radius
    });
    let homePlanetEnvironement = this.properties.homePlanetEnvironement;
    let envDecider = {
      'MULTI BIOME': 'blue',
      'DESERT': 'sun',
      'FOREST': 'green',
      'ICE': 'blue',
      'OCEAN': 'blue',
      'JUNGLE': 'purple'
    };
    let env;
    let colorPicker;
    let color;

    if (homePlanetEnvironement && homePlanet) {
      env = envDecider[homePlanetEnvironement];
      color = env;
    } else {
      colorPicker = ['green', 'blue', 'orange', 'purple'];
      color = colorPicker[Math.floor(4 * Math.random())];
    };

    planet.material = this.colorMat[color] || this.colorMat['blue'];

    // Planet data
    planet.data = {
      distance: this.properties.radiusMin + i * (this.properties.radiusMax - this.properties.radiusMin),
      angle: Math.random() * Math.PI * 2,
      homePlanet: homePlanet,
      shape: shapePicker,
      radius,
      color
    };

    let x = Math.cos(planet.data.angle) * planet.data.distance,
        y = -10 * Math.random() + 4,
        z = Math.sin(planet.data.angle) * planet.data.distance,
        rotationX = Math.PI * 2 * Math.random(),
        rotationY = Math.PI * 2 * Math.random(),
        rotationZ = Math.PI * 2 * Math.random();

    planet.data = {
      ...planet.data,
      x,
      y,
      z,
      rotationX,
      rotationY,
      rotationZ,
      homePlanet: homePlanet
    };

    // Set position & rotation.
    planet.position.x = x;
    planet.position.z = z;
    planet.position.y = y;
    planet.rotation.set(rotationX, rotationY, rotationZ);

    this.mouseTrackPlanet(planet);

    planet.addTo(this.planets);
    return planet;
  }

  generateMoon(planet, homePlanet, extraDistance = 0, planetIdx) {
    this.moons = new WHS.Group();
    this.moons.addTo(planet);
    const moon = _.sample([this.s1, this.s1, this.s4, this.s4, this.s1]).clone(),
      radius = this.properties.moonMinRadius + Math.random() * (this.properties.moonMaxRadius - this.properties.moonMinRadius);

    moon.g_({
      radiusBottom: radius,
      radiusTop: 0,
      height: moon instanceof WHS.Cylinder ? radius * 2 : radius,
      width: radius,
      depth: radius,
      radius
    });

    let colorPicker = ['green', 'blue', 'orange', 'blue'];
    let color = colorPicker[Math.floor(4 * Math.random())];
    moon.material = this.colorMat[color];
    // Planet data
    moon.data = {
      distance: radius + extraDistance + 40,
      angle: Math.random() * Math.PI * 2,
      homePlanet: homePlanet,
      rotationX: Math.PI * 2 * Math.random(),
      rotationY: Math.PI * 2 * Math.random(),
      rotationZ: Math.PI * 2 * Math.random(),
      x,
      y,
      z,
      color,
      shape: (planet instanceof WHS.Dodecahedron) ? 'Dodecahedron' : 'Sphere',
      planetIdx: planetIdx,
      radius
    };

    let y = Math.cos(moon.data.angle) * moon.data.distance;
    let z = Math.sin(moon.data.angle) * moon.data.distance;
    let x = 0;

    // Set position & rotation.
    moon.position.y = y;
    moon.position.z = z;
    moon.position.x = x;

    moon.data.x = x;
    moon.data.y = y;
    moon.data.z = z;

    moon.rotation.set(moon.data.rotationX, moon.data.rotationY, moon.data.rotationZ);

    moon.addTo(this.moons);
    return moon;
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
    // Cone
    const scale = 1;
    const cone = new WHS.Cone({
      geometry: {
        radius: scale / 2,
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
    const face = _.sample(sg.faces); // the actual face
    const point = sg.vertices[face.a]; // selected vertice (can be a, b or c)
    const pointNormal = face.vertexNormals[0]; // it's normal (a=0)
    const quat = new THREE.Quaternion().setFromUnitVectors(upVec, pointNormal);

    this.tree = new WHS.Group(cone); // = Object3D in Three.js

    this.tree.data = {
      pointX: point.x,
      pointY: point.y,
      pointZ: point.z,
      pointNormalX: pointNormal.x,
      pointNormalY: pointNormal.y,
      pointNormalZ: pointNormal.z
    };

    this.tree.position.copy(point);
    this.tree.quaternion.copy(quat);
    this.tree.addTo(planet);
    return this.tree.data;
  }


  loadTrees(properties, homePlanet) {
    // Cone
    const scale = 1;
    const upVec = new THREE.Vector3(0, 1, 0);
    _.forEach(properties.treeArr, (treeObj, i) => {
      const cone = new WHS.Cone({
        geometry: {
          radius: scale / 2,
          height: scale * 2
        },

        material: new THREE.MeshPhongMaterial({
          color: colors.sun,
        }),
        position: [0, scale, 0]
      });
      const point = new THREE.Vector3(treeObj.pointX, treeObj.pointY, treeObj.pointZ);
      const pointNormal = new THREE.Vector3(treeObj.pointNormalX, treeObj.pointNormalY, treeObj.pointNormalZ);
      const quat = new THREE.Quaternion().setFromUnitVectors(upVec, pointNormal);
      const tree = new WHS.Group(cone);

      tree.position.copy(point);
      tree.quaternion.copy(quat);
      tree.addTo(homePlanet);
    });
  }

  addCityToPlanet(planet) {
    const normalsHelper = new THREE.VertexNormalsHelper(planet.native);
    // Cube
    const scale = 2;
    const cube = new WHS.Box({
      geometry: {
        height: scale * 2,
        width: scale * 1,
        depth: scale * 2
      },

      material: new THREE.MeshPhongMaterial({
        color: colors.blue,
        shading: THREE.FlatShading
      }),
      position: [0, scale, 0]
    });
    const upVec = new THREE.Vector3(0, 1, 0);
    const sg = planet.geometry;
    sg.computeVertexNormals();
    const face = _.sample(sg.faces);

    const point = sg.vertices[face.b];

    const pointNormal = face.vertexNormals[0];
    const faceNormal = face.normal;
    const quat = new THREE.Quaternion().setFromUnitVectors(upVec, faceNormal);

    this.city = new WHS.Group(cube);

    this.city.data = {
      pointX: point.x,
      pointY: point.y,
      pointZ: point.z,
      faceNormalX: faceNormal.x,
      faceNormalY: faceNormal.y,
      faceNormalZ: faceNormal.z
    };

    this.city.position.copy(point);
    this.city.quaternion.copy(quat);
    this.city.addTo(planet);

    return this.city.data;
  }

  loadCity(properties, homePlanet) {
    const scale = 2;
    const upVec = new THREE.Vector3(0, 1, 0);
    _.forEach(properties.cityArr, (cityObj, i) => {
      const cube = new WHS.Box({
        geometry: {
          height: scale * 2,
          width: scale * 1,
          depth: scale * 2
        },

        material: new THREE.MeshPhongMaterial({
          color: colors.blue,
          shading: THREE.FlatShading
        }),
        position: [0, scale, 0]
      });

      const point = new THREE.Vector3(cityObj.pointX, cityObj.pointY, cityObj.pointZ);
      const faceNormal = new THREE.Vector3(cityObj.faceNormalX, cityObj.faceNormalY, cityObj.faceNormalZ);
      const quat = new THREE.Quaternion().setFromUnitVectors(upVec, faceNormal);
      this.city = new WHS.Group(cube);

      this.city.data = {
        pointX: point.x,
        pointY: point.y,
        pointZ: point.z,
        faceNormalX: faceNormal.x,
        faceNormalY: faceNormal.y,
        faceNormalZ: faceNormal.z
      };

      this.city.position.copy(point);
      this.city.quaternion.copy(quat);
      this.city.addTo(homePlanet);
    });
  }

  addLandMassToPlanet(planet) {
    this.landMass = new WHS.Group();
    this.landMass.addTo(planet);
    this.homePlanet = planet;

    const normalsHelper = new THREE.VertexNormalsHelper(planet.native);
    const upVec = new THREE.Vector3(0, 1, 0);
    const sg = planet.geometry;
    sg.computeVertexNormals();

    const landMassArr = [];

    for (let i = 0; i < 300; i++) {
      const face = _.sample(sg.faces);

      const point = sg.vertices[face.a];

      const pointNormal = face.vertexNormals[0];
      const faceNormal = face.normal;
      const quat = new THREE.Quaternion().setFromUnitVectors(upVec, faceNormal);

      const land = this.landMassShape.clone();
      const radius = this.properties.moonMinRadius + Math.random() * (this.properties.moonMaxRadius - this.properties.moonMinRadius);

      land.g_({
        radiusBottom: radius * 0.7,
        radiusTop: 0,
        height: land instanceof WHS.Cylinder ? radius * 1/5 : radius,
        width: radius/2,
        depth: radius/2,
        radius
      });

      land.material = this.mat[0]; // Set custom THREE.Material to mesh.

      // Planet data
      land.data = {
        distance: planet.geometry.boundingSphere.radius - 5,
        angle: Math.random() * Math.PI * 2,
        radius,
        pointX: point.x,
        pointY: point.y,
        pointZ: point.z,
        faceNormalX: faceNormal.x,
        faceNormalY: faceNormal.y,
        faceNormalZ: faceNormal.z
      };

      // Set position & rotation.
      land.position.copy(point);
      land.quaternion.copy(quat);

      land.addTo(this.landMass);
      landMassArr.push(JSON.parse(JSON.stringify(land.data)));
    }
    return landMassArr;
  }

  loadLandMass(properties, homePlanet) {
    this.landMass = new WHS.Group();
    this.landMass.addTo(homePlanet);
    this.homePlanet = homePlanet;

    const upVec = new THREE.Vector3(0, 1, 0);

    for (let i = 0; i < properties.landMassArr.length; i++) {
      const data = properties.landMassArr[i];
      const point = new THREE.Vector3(data.pointX, data.pointY, data.pointZ);
      const faceNormal = new THREE.Vector3(data.faceNormalX, data.faceNormalY, data.faceNormalZ);
      const quat = new THREE.Quaternion().setFromUnitVectors(upVec, faceNormal);

      const land = this.landMassShape.clone();
      const radius = data.radius

      land.g_({
        radiusBottom: radius * 0.7,
        radiusTop: 0,
        height: land instanceof WHS.Cylinder ? radius * 1/5 : radius,
        width: radius/2,
        depth: radius/2,
        radius
      });

      land.material = this.mat[0]; // Set custom THREE.Material to mesh.

      // Set position & rotation.
      land.position.copy(point);
      land.quaternion.copy(quat);

      land.addTo(this.landMass);
    }
    return this.landMass;
  }

  generateCrazyPlanet() {
    this.clearSolarSystem();

    this.space = new WHS.Group();
    this.space.addTo(this.app);
    this.sun = star(this.properties.sunSize, this.properties.sunColor);
    this.sun.addTo(this.space);

    this.space.rotation.z = Math.PI / 12;

    this.planets = new WHS.Group();
    this.planets.addTo(this.space);

    this.planetsArr = this.properties.planetsArr;

    for (let i = 0; i < this.properties.planetCount; i++) {
      this.properties.planetsArr[i].addTo(this.planets);
    }

    let lastPlanet = _.last(this.properties.planetsArr);
    let lastPlanetDistance = lastPlanet.data.distance;

    this.generateSolarAsteroidBelt(this.sun, 3, 6, lastPlanetDistance + 100);
    this.animation.start();
  }

  loadPlanet(planetObj) {
    console.log(planetObj.shape);
    let shape = {'Diamond': this.s3, 'Sphere': this.s4, 'Dodecahedron': this.s2, 'Tetrahedron': this.s1};
    let planet = shape[planetObj.shape].clone();

    const radius = planetObj.radius;

    if (planetObj.homePlanet) {
      planet = this.homePlanetShape.clone();
    };

    planet.g_({
      radiusBottom: radius,
      radiusTop: 0,
      height: radius,
      width: radius,
      depth: radius,
      radius
    });

    planet.material = this.colorMat[planetObj.color];

    let x = planetObj.x,
        y = planetObj.y,
        z = planetObj.z,
        rotationX = planetObj.rotationX,
        rotationY = planetObj.rotationY,
        rotationZ = planetObj.rotationZ;

    // Set position & rotation.
    planet.position.x = x;
    planet.position.z = z;
    planet.position.y = y;
    planet.rotation.set(rotationX, rotationY, rotationZ);

    planet.data = planetObj

    this.mouseTrackPlanet(planet);
    return planet;
  }

  loadMoon(moonObj) {
    let shape = {'Dodecahedron': this.s1, 'Sphere': this.s4};
    let moon = shape[moonObj.shape].clone();

    const radius = moonObj.radius;

    moon.g_({
      radiusBottom: radius,
      radiusTop: 0,
      height: radius,
      width: radius,
      depth: radius,
      radius
    });

    moon.material = this.colorMat[moonObj.color];

    let x = moonObj.x,
        y = moonObj.y,
        z = moonObj.z,
        rotationX = moonObj.rotationX,
        rotationY = moonObj.rotationY,
        rotationZ = moonObj.rotationZ;

    // Set position & rotation.
    moon.position.x = x;
    moon.position.z = z;
    moon.position.y = y;
    moon.rotation.set(rotationX, rotationY, rotationZ);

    moon.data = moonObj
    return moon;
  }

  loadSystem(properties) {
    this.clearSolarSystem();
    this.properties = properties;

    this.space = new WHS.Group();
    this.space.addTo(this.app);
    this.sun = star(properties.sunSize, properties.sunColor);
    this.sun.addTo(this.space);

    this.space.rotation.z = Math.PI / 12;

    this.planets = new WHS.Group();
    this.planets.addTo(this.space);

    const planetsArr = [];
    this.planetsArr = [];
    for (let i = 0; i < properties.storeablePlanetsData.length; i++) {
      let planet = this.loadPlanet(properties.storeablePlanetsData[i]);
      planet.addTo(this.planets);
      planetsArr.push(planet);
      this.planetsArr.push(planet);
    }

    _.forEach(properties.storeableMoonData, (moon, j) => {
      this.moons = new WHS.Group();
      this.moons.addTo(planetsArr[moon.planetIdx]);
      this.loadMoon(moon, planetsArr[moon.planetIdx]).addTo(this.moons);
    });

    const homePlanetIdx = _.findIndex(planetsArr, (planet) => { return planet.data.homePlanet});
    const homePlanet = planetsArr[homePlanetIdx];

    this.loadLandMass(properties, homePlanet);
    this.loadTrees(properties, homePlanet);
    this.loadCity(properties, homePlanet);

    for (let k = 0; k < properties.asteroidBeltPlanetArr.length; k++) {
      const planet = properties.asteroidBeltPlanetArr[k];
      this.generateAsteroidBelt(planetsArr[planet.id]);
      if (planet.rings === 2) {
        this.generateAsteroidBelt(planetsArr[planet.id], 30, 'blue');
      }
    }

    let lastPlanet = _.last(properties.storeablePlanetsData);
    let lastPlanetDistance = lastPlanet.distance;

    this.generateSolarAsteroidBelt(this.sun, 3, 6, lastPlanetDistance + 100);


    // this.sunLight = new WHS.PointLight( {
    //   color: 0xffffff,
    //   intensity: 3,
    //   distance: 20000,
    //   position: [properties.sunSize + 20, properties.sunSize + 20, properties.sunSize + 20]
    // });
    //
    // this.sunLight2 = new WHS.PointLight( {
    //   color: 0xffffff,
    //   intensity: 3,
    //   distance: 20000,
    //   position: [-properties.sunSize - 20, -properties.sunSize - 20, 0]
    // });
    //
    // this.sunLight.addTo(this.app);
    // this.sunLight2.addTo(this.app);


    this.animation.start();
  }

  clearCameraAnimation() {
    this.space.rotation.z = Math.PI / 12;
    this.cameraAnimation.stop();
  }

  followHomePlanet() {
    const planetsArr = this.planetsArr;

    const homePlanetIdx = _.findIndex(planetsArr, (planet) => { return planet.data.homePlanet});
    const planet = planetsArr[homePlanetIdx];

    if (this.cameraAnimation) {
      this.cameraAnimation.stop();
    }
    this.space.rotation.z -= Math.PI / 12;
    this.cameraAnimation = new WHS.Loop(() => {

      var relativeCameraOffset = new THREE.Vector3(50,50,50);
      var cameraOffset = relativeCameraOffset.applyMatrix4( planet.native.matrixWorld );

      planet.rotation.y -= 2 / 30;

      // this.camera.position.x = cameraOffset.x;
      // this.camera.position.y = cameraOffset.y;
      // this.camera.position.z = cameraOffset.z;

      this.camera.native.lookAt(planet.position);

      this.camera.position.set(planet.position.x + 50, planet.position.y + 50, planet.position.z + 50);
    });

    this.app.addLoop(this.cameraAnimation);
    this.cameraAnimation.start();

  }

  mouseTrackPlanet(planet) {
    this.mouse.track(planet);
    planet.on('click', () => {
      if (this.cameraAnimation) {
        this.cameraAnimation.stop();
      }
      this.space.rotation.z -= Math.PI / 12;
      this.cameraAnimation = new WHS.Loop(() => {
        planet.rotation.y -= 2 / 30;
        var relativeCameraOffset = new THREE.Vector3(0,200,0);
        var cameraOffset = relativeCameraOffset.applyMatrix4( planet.native.matrixWorld );
        //
        this.camera.position.x = cameraOffset.x;
        this.camera.position.y = cameraOffset.y;
        this.camera.position.z = cameraOffset.z;

        this.camera.native.lookAt(planet.position);
        this.camera.native.zoom = 2000;
        // this.camera.position.set(planet.position.x + 100, planet.position.y + 100, planet.position.z + 100);
      });

      this.app.addLoop(this.cameraAnimation);
      this.cameraAnimation.start();

    });
  }

  randomView() {
    const planet = _.sample(this.planetsArr);
    const anotherPlanet = _.sample(this.planetsArr);

    if (this.cameraAnimation) {
      this.cameraAnimation.stop();
    }
    this.space.rotation.z -= Math.PI / 12;
    this.cameraAnimation = new WHS.Loop(() => {
      planet.rotation.y -= 2 / 30;
      var relativeCameraOffset = new THREE.Vector3(0,200,0);
      var cameraOffset = relativeCameraOffset.applyMatrix4( planet.native.matrixWorld );
      //
      this.camera.position.x = cameraOffset.x;
      this.camera.position.y = cameraOffset.y;
      this.camera.position.z = cameraOffset.z;

      this.camera.native.lookAt(anotherPlanet.position);
      this.camera.native.zoom = 2000;
      // this.camera.position.set(planet.position.x + 100, planet.position.y + 100, planet.position.z + 100);
    });

    this.app.addLoop(this.cameraAnimation);
    this.cameraAnimation.start();
  }

  clearSolarSystem() {
    this.animation.stop();
    this.landMass = new WHS.Group();

    // this.app.remove(this.sunLight);
    // this.app.remove(this.sunLight2);

    this.cameraAnimation.stop();
    this.space.remove(this.planets);
    this.space.remove(this.moons);
    // this.space.remove(this.landMass);
    this.planets.remove(this.moons);
    this.planets.remove(this.landMass);
    this.planets.remove(this.asteroidBelt);
    this.planets.remove(this.tree);
    this.space.remove(this.sun);
    this.space.remove(this.asteroidBelt);
    this.space.remove(this.solarAsteroidBelt);
    this.app.remove(this.space);
  }

  addTreeToHomePlanet() {
    const planetsArr = this.properties.planetsArr;
    const homePlanetIdx = _.findIndex(planetsArr, (planet) => { return planet.data.homePlanet});
    const planet = planetsArr[homePlanetIdx];

    return this.addTreeToPlanet(planet);
  }

  addLandMassToHomePlanet() {
    const planetsArr = this.properties.planetsArr;
    const homePlanetIdx = _.findIndex(planetsArr, (planet) => { return planet.data.homePlanet});
    const planet = planetsArr[homePlanetIdx];

    return this.addLandMassToPlanet(planet);
  }

  addCitiesToHomePlanet() {
    const planetsArr = this.properties.planetsArr;
    const homePlanetIdx = _.findIndex(planetsArr, (planet) => { return planet.data.homePlanet});
    const planet = planetsArr[homePlanetIdx];

    return this.addCityToPlanet(planet);
  }
}

export default SolarSystem;
