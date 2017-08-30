import * as WHS from 'whs';

// LIGHTS.
const AmbientLight = new WHS.AmbientLight({
  color: 0x663344,
  intensity: 4
});

const DirectionalLight = new WHS.DirectionalLight({
  color: 0xffffff,
  intensity: 1.5,
  distance: 800,

  shadow: {
    mapSize: {
      width: 2048,
      height: 2048
    },

    camera: {
      left: -800,
      right: 800,
      top: 800,
      bottom: -800,
      far: 800
    }
  },

  position: {
    x: 300,
    z: 300,
    y: 100
  }
});

export { DirectionalLight, AmbientLight };
