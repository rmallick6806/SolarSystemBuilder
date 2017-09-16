import * as WHS from 'whs';
import * as THREE from 'three';

const star = function(radius, color) {
  return new WHS.Octahedron({
    geometry: {
      radius,
      detail: 2
    },

    material: new THREE.MeshStandardMaterial({
      color,
      shading: THREE.FlatShading,
      roughness: 0.9,
      emissive: 0x270000
    })
  });
}

const landMass = function(dynamicGeometry, material) {
  return new WHS.Cylinder({
    geometry: {
      radius: 5,
      detail: 2
    },

    modules: [
      dynamicGeometry
    ],
    material
  });
}

const planetShape1 = function(dynamicGeometry, material) {
  return new WHS.Tetrahedron({
    geometry: {
      buffer: true,
      radius: 10,
      detail: 2
    },
    modules: [
      dynamicGeometry
    ],
    material
  })
};

const planetShape2 = function(dynamicGeometry, material) {
  return new WHS.Dodecahedron({
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
  })
};

const planetShape3 = function(dynamicGeometry, material) {
  return new WHS.Octahedron({
   geometry: {
     buffer: true,
     radiusTop: 0,
     radiusBottom: 10,
     height: 10,
     detail: 0
   },
   modules: [
     dynamicGeometry
   ],

   material
 });
}

const planetShape4 = function (dynamicGeometry, material) {
  return new WHS.Octahedron({
    geometry: {
      buffer: true,
      radius: 10,
      detail: 2
    },
    modules: [
      dynamicGeometry
    ],

    material
  });
}

const homePlanet = function (dynamicGeometry, material) {
  return new WHS.Sphere({
    geometry: {
      buffer: true,
      radius: 10,
      widthSegments: 32,
      heightSegments: 32
    },
    modules: [
      dynamicGeometry
    ],

    material
  });
}

export { star, planetShape1, planetShape2, planetShape3, planetShape4, homePlanet, landMass };
