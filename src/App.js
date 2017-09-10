import React, { Component } from 'react';
import './App.css';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';
import MenuItem from 'material-ui/MenuItem';
import classList from 'react-classlist-helper';
import SolarSystem from './solarSystem.js';
import _ from 'lodash';
import { colors } from './colors.js';
import * as WHS from 'whs';
import * as THREE from 'three';

import createDeepstream from 'deepstream.io-client-js';
import CircularJSON from 'circular-json';
import stringify from 'json-stringify-safe';

import {TweenMax, Linear, TimelineLite} from "gsap";

const muiTheme = getMuiTheme({
  color: 'white'
});

class App extends Component {
  constructor() {
    super();
    this.state = {};
    this.solarSystem;
    this.ds = createDeepstream('wss://013.deepstreamhub.com?apiKey=29364a74-fdca-42d6-8c3a-2424cfbce5d8');
    this.client = this.ds.login();
  }

  componentDidMount() {
    let el = document.getElementById('mainHeader');
    let smallEl = document.getElementById('header');
    let pressHereButton = document.getElementById('pressHereButton');

    TweenMax.set(el, {opacity: 0});
    TweenMax.set(smallEl, {opacity: 0});
    TweenMax.set(pressHereButton, {bottom: -300});

    TweenMax.to(el, 3, {opacity: 1, delay: 3});
    TweenMax.to(smallEl, 3, {opacity: 1, top: '50%'});
    TweenMax.to(pressHereButton, 3, {bottom: 60, delay: 4});


    this.solarSystem = new SolarSystem();
    const radiusMin = 190, // Min radius of the planet belt.
      radiusMax = 300, // Max radius of the planet belt.
      planetCount = 9, // Ammount of planets.
      planetMinRadius = 20, // Min of planet radius.
      planetMaxRadius = 50, // Max of planet radius.
      asteroidMinRadius = 1,
      asteroidMaxRadius = 3,
      sunSize = 140, // Radius of sun
      moonMinRadius = 5,
      moonMaxRadius = 8;

    let starterProperties = {
      radiusMin,
      radiusMax,
      planetMinRadius,
      planetMaxRadius,
      planetCount,
      asteroidMaxRadius,
      asteroidMinRadius,
      moonMaxRadius,
      moonMinRadius,
      sunSize
    };

    this.solarSystem.setProperties(starterProperties);
    this.solarSystem.init();
  }

  onCreateSystemClick() {
    this.setState({createSystem: true})
  }

  onGenerateNewSystem(properties) {
    const {animalValue, value, systemName} = this.state;
    const nameBox = this.refs.nameBox;
    let el = document.getElementById('mainHeader');
    let smallEl = document.getElementById('header');
    let creationMenu = document.getElementById('creationMenu');

    TweenMax.set(el, {display: 'none'});
    TweenMax.set(smallEl, {display: 'none'});
    TweenMax.set(creationMenu, {display: 'none'});

    this.setState({loading: true});

    _.delay(() => this.setState({generateNewSystem: true, loading: false}), 2000);

    // const radiusMin = 190; // Min radius of the planet belt.
    // const radiusMax = 300; // Max radius of the planet belt.
    const planetMinRadius = 10; // Min of planet radius.
    const planetMaxRadius = 60; // Max of planet radius.
    const asteroidMinRadius = 1;
    const asteroidMaxRadius = 3;
    const sunSize = 20; // Radius of sun

    let planetCountDecider = {
      1: _.sample(_.range(15, 22)),
      2: _.sample(_.range(12, 17)),
      3: _.sample(_.range(8, 11)),
      4: _.sample(_.range(6, 8)),
      5: _.sample(_.range(6, 8))
    }

    let planetEnvironmentDecider = {
      1: 'MULTI BIOME',
      2: 'JUNGLE',
      3: 'FOREST',
      4: 'ICE',
      5: 'DESERT',
      6: 'OCEAN'
    };
    let sunDecider = {
      1: {
        1: {
          size: _.sample(_.range(60, 90, 5)),
          color: colors.sun,
          type: 'Young Sun-like Star'
        },
        2: {
          size: _.sample(_.range(60, 90, 5)),
          color: colors.sun,
          type: 'Young Sun-like Star'
        },
        3: {
          size: _.sample(_.range(60, 90, 5)),
          color: colors.blue,
          type: 'Young Massive Blue Star'
        },
        4: {
          size: _.sample(_.range(60, 90, 5)),
          color: colors.blue,
          type: 'Young Massive Blue Star'
        },
        5: {
          size: _.sample(_.range(60, 90, 5)),
          color: colors.sun,
          type: 'Young Sun-like Star'
        },
        6: {
          size: _.sample(_.range(60, 90, 5)),
          color: colors.blue,
          type: 'Young Massive Blue Star'
        }
      },
      2: {
        1: {
          size: _.sample(_.range(60, 90, 5)),
          color: colors.sun,
          type: 'Young Sun-like Star'
        },
        2: {
          size: _.sample(_.range(60, 90, 5)),
          color: colors.sun,
          type: 'Young Sun-like Star'
        },
        3: {
          size: _.sample(_.range(60, 90, 5)),
          color: colors.blue,
          type: 'Massive Blue Star'
        },
        4: {
          size: _.sample(_.range(60, 90, 5)),
          color: colors.blue,
          type: 'Massive Blue Star'
        },
        5: {
          size: _.sample(_.range(60, 90, 5)),
          color: colors.sun,
          type: 'Young Sun-like Star'
        },
        6: {
          size: _.sample(_.range(60, 90, 5)),
          color: colors.blue,
          type: 'Massive Blue Star'
        }
      },
      3: {
        1: {
          size: _.sample(_.range(120, 220, 5)),
          color: colors.sun,
          type: 'Average Sun-like Star'
        },
        2: {
          size: _.sample(_.range(120, 220, 5)),
          color: colors.sun,
          type: 'Average Sun-like Star'
        },
        3: {
          size: _.sample(_.range(120, 220, 5)),
          color: colors.blue,
          type: 'Massive Blue Star'
        },
        4: {
          size: _.sample(_.range(120, 220, 5)),
          color: colors.blue,
          type: 'Massive Blue Star'
        },
        5: {
          size: _.sample(_.range(120, 220, 5)),
          color: colors.sun,
          type: 'Average Sun-like Star'
        },
        6: {
          size: _.sample(_.range(120, 220, 5)),
          color: colors.blue,
          type: 'Massive Blue Star'
        }
      },
      4: {
        1: {
          size: _.sample(_.range(220, 300, 10)),
          color: colors.red,
          type: 'Red-Giant Star'
        },
        2: {
          size: _.sample(_.range(220, 300, 10)),
          color: colors.red,
          type: 'Red-Giant Star'
        },
        3: {
          size: _.sample(_.range(220, 300, 10)),
          color: colors.sun,
          type: 'Red Supergiant Star'
        },
        4: {
          size: _.sample(_.range(220, 300, 10)),
          color: colors.sun,
          type: 'Red Supergiant Star'
        },
        5: {
          size: _.sample(_.range(220, 300, 10)),
          color: colors.red,
          type: 'Red-Giant Star'
        },
        6: {
          size: _.sample(_.range(220, 300, 10)),
          color: colors.sun,
          type: 'Red Supergiant Star'
        }
      },
      5: {
        1: {
          size: _.sample(_.range(500, 600, 5)),
          color: colors.red,
          type: 'Red-Giant Star'
        },
        2: {
          size: _.sample(_.range(500, 600, 5)),
          color: colors.red,
          type: 'Red-Giant Star'
        },
        3: {
          size: _.sample(_.range(500, 600, 5)),
          color: colors.sun,
          type: 'Red Supergiant Star'
        },
        4: {
          size: _.sample(_.range(500, 600, 5)),
          color: colors.sun,
          type: 'Red Supergiant Star'
        },
        5: {
          size: _.sample(_.range(500, 600, 5)),
          color: colors.red,
          type: 'Red-Giant Star'
        },
        6: {
          size: _.sample(_.range(500, 600, 5)),
          color: colors.sun,
          type: 'Red Supergiant Star'
        }
      }
    };

    let planetCount = planetCountDecider[value];
    let homePlanetEnvironement = planetEnvironmentDecider[animalValue];
    let sun = sunDecider[value][animalValue];
    let planetsArr = []
    let radiusMin = sun.size + 50;
    let radiusMax = sun.size + 300;
    let moonMinRadius = 5;
    let moonMaxRadius = 8;

    let newProperties = {
      name: systemName || 'Ray-1',
      homePlanetEnvironement,
      planetsArr,
      radiusMin,
      radiusMax,
      planetMinRadius,
      planetMaxRadius,
      planetCount,
      asteroidMaxRadius,
      asteroidMinRadius,
      moonMaxRadius,
      moonMinRadius,
      sunSize: sun.size,
      sunColor: sun.color,
      sunType: sun.type,
      homePlanetEnvironement
    };

    this.solarSystem.clearSolarSystem();
    this.solarSystem.setProperties(newProperties);

    const getRandomInt = function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const homePlanetInt = getRandomInt(2, planetCount - 1);
    const asteroidBeltInt = getRandomInt(1, 3);
    const asteroidBeltPlanetArr = [];
    const moonInt = getRandomInt(1, planetCount - 2);
    const moonPlanetsArr = [];
    const diceRoll = getRandomInt(1, 20);

    const planetCountArr = _.range(2, planetCount);
    const planetCountArrForMoons = _.range(2, planetCount);

    for (let j = 0; j < planetCount; j++) {
      if (homePlanetInt === j) {
        planetsArr.push(this.solarSystem.generatePlanet(j, true));
      } else {
        planetsArr.push(this.solarSystem.generatePlanet(j));
      }
    }

    for (let i = 0; i < asteroidBeltInt; i++) {
      const planetNum = _.sample(planetCountArr);
      _.pull(planetCountArr, planetNum)
      const diceRoll = getRandomInt(1, 20);
      const rings = (diceRoll >= 15) ? 2 : 1;
      asteroidBeltPlanetArr.push({id: planetNum, rings: rings});
    };

    for (let k = 0; k < asteroidBeltPlanetArr.length; k++) {
      const planet = asteroidBeltPlanetArr[k];
      this.solarSystem.generateAsteroidBelt(planetsArr[planet.id]);
      if (planet.rings === 2) {
        this.solarSystem.generateAsteroidBelt(planetsArr[planet.id], 30, 'blue');
      }
    }

    for (let p = 0; p < moonInt; p++) {
      const planetNum = _.sample(planetCountArrForMoons);
      const diceRoll = getRandomInt(1, 20);
      _.pull(planetCountArrForMoons, planetNum)
      let moons = 1;
      moons = (diceRoll >= 12) ? moons + 1 : moons + 0;
      moons = (diceRoll >= 15) ?  moons + 1 : moons + 0;
      moons = (diceRoll >= 18) ?  moons + 1 : moons + 0;

      moonPlanetsArr.push({id: planetNum, moons: moons});
    };

    const storeableMoonData = [];
    for (let h = 0; h < moonPlanetsArr.length; h++) {
      const planet = moonPlanetsArr[h];
      let moon1 = this.solarSystem.generateMoon(planetsArr[planet.id], false, 0, planet.id);
      storeableMoonData.push(moon1.data);
      if (planet.moons > 2) {
        let moon2 = this.solarSystem.generateMoon(planetsArr[planet.id], false, 40, planet.id);
        storeableMoonData.push(moon2.data);
      }
      if (planet.moons >= 3) {
        let moon3 = this.solarSystem.generateMoon(planetsArr[planet.id], false, 60, planet.id);
        storeableMoonData.push(moon3.data);
      }
    };

    let storeablePlanetsData = [];
    _.forEach(planetsArr, (planet, i) => {
      storeablePlanetsData.push(
        planet.data
      );
    });

    newProperties = {
      ...newProperties,
      storeablePlanetsData,
      storeableMoonData,
      planetsArr,
      asteroidBeltPlanetArr,
      moonPlanetsArr,
      landMassArr: [],
      cityArr: [],
      treeArr: []
    };

    this.solarSystem.generateCrazyPlanet();
    this.solarSystem.clearCameraAnimation();
    this.setState({newSystem: newProperties});

    let recordName = 'system/' + systemName;
    this.record = this.client.record.getRecord(recordName);
    this.record.set({
      ...newProperties,
      planetsArr: null
    });
  }

  loadSystem(properties) {
    let loadedProperties = this.record.get();
    this.solarSystem.setProperties(loadedProperties);
    this.solarSystem.loadSystem(loadedProperties);
  }

  handleChange = (event, index, value) => this.setState({value});
  handleNameChange = (event, systemName) => this.setState({systemName});
  handleAnimalChange = (event, index, animalValue) => this.setState({animalValue});

  onConfigureHomePlanet() {
    this.setState({configuringHomePlanet: true});
    this.solarSystem.followHomePlanet();
  }

  getSolarSystemName() {
    return (
      <div id='systemNameContainer'>
        <div className='welcome-to' id='header'>Welcome to</div>
        <div className='system-name' id='mainHeader'> System {this.state.newSystem.name} </div>
      </div>
    );
  }

  onAddLandMassToHomePlanet() {
    const { newSystem } = this.state;
    let landMassArr = newSystem.landMassArr;
    let addedLand = this.solarSystem.addLandMassToHomePlanet();
    landMassArr = _.concat(landMassArr, addedLand);

    this.setState({
      newSystem: {
      ...newSystem,
      landMassArr
    }});
    console.log(landMassArr, addedLand);
    this.record.set({
      ...newSystem,
      planetsArr: null,
      landMassArr
    });
  }

  getHomePlanetConfigurationModal() {
    const { newSystem, configuringHomePlanet } = this.state;
    const menuClassMap = {
      'home-planet-modal': true,
      'show': configuringHomePlanet
    };

    return (
      <div className={classList(menuClassMap)} id='creationMenu'>
          <div>This Is Your Home Planet!</div>
          <h5>Your planet is a {newSystem.homePlanetEnvironement} Planet </h5>
          <h5>{`It is a very early in it's lifetime. A small civilization has started its journey on this planet!`}</h5>
          <div className='generate-system-button' onClick={() => this.solarSystem.addTreeToHomePlanet()}>Add Trees</div>
          <div className='generate-system-button' onClick={() => this.solarSystem.addCitiesToHomePlanet()}>Add Cities</div>
          <div className='generate-system-button' onClick={this.onAddLandMassToHomePlanet.bind(this)}>Add Land</div>
      </div>
    );
  }

  getGeneratedSystemModal() {
    const { newSystem, configuringHomePlanet } = this.state;
    const menuClassMap = {
      'generated-system-modal': true,
      'hide': configuringHomePlanet
    };
    const moonPlanets = newSystem.moonPlanetsArr.length;
    const ringPlanets = newSystem.asteroidBeltPlanetArr.length;

    return (
      <div className={classList(menuClassMap)} id='creationMenu'>
          <div>Welcome to System {this.state.newSystem.name}</div>
          <h5>Your System Has...</h5>
          <ul>
            <li><p>{newSystem.sunType} at the center</p></li>
            <li><p>{newSystem.planetsArr.length} Planets</p></li>
            <li><p>{(moonPlanets > 1) ? `${moonPlanets} Planets Have Moons` : `1 Planet has a Moon`}</p></li>
            <li><p>{(ringPlanets > 1) ? `${ringPlanets} Planets Have Rings` : `1 Planet has a ring`}</p></li>
          </ul>
          <div className='generate-system-button' onClick={this.onConfigureHomePlanet.bind(this)}>Configure Home Planet!</div>
      </div>
    );
  }

  render() {
    const { createSystem, generateNewSystem, loading } = this.state;
    const buttonClassMap = {
      'create-system-button': true,
      'hide': createSystem
    };

    const menuClassMap = {
      'create-system-menu': true,
      'show': createSystem && !generateNewSystem,
      'hide': generateNewSystem || loading
    };

    return (
      <div className="App">
        <div className='main-container' id='mainContainer'>
          <div className='header' id='header'>Capital One Presents...</div>
          <div className='main-header' id='mainHeader'> Boulder Galaxy </div>
          <button onClick={() => this.solarSystem.clearSolarSystem()}>Click to Test</button>
          <button onClick={() => this.loadSystem(this.state.newSystem)}>Load Solar System</button>
          {loading ? <div className='loading-menu'>Generating Your Solar System</div> : null}
          {generateNewSystem && !loading ? this.getSolarSystemName() : null}
          {generateNewSystem && !loading ? this.getGeneratedSystemModal() : null}
          {generateNewSystem && !loading ? this.getHomePlanetConfigurationModal() : null}
          <div className='unlock-camera-button' onClick={() => this.solarSystem.clearCameraAnimation()}>Unlock Camera</div>
          <div className={classList(buttonClassMap)} onClick={this.onCreateSystemClick.bind(this)} id='pressHereButton'>Press Here to Create Your Own System</div>
          <div className={classList(menuClassMap)} id='creationMenu'>
              <div>Create Your Own System</div>
              <h5> Name your solar system </h5>
              <MuiThemeProvider muiTheme={muiTheme}>
                <TextField hintText="Enter a name..." ref='nameBox' value={this.state.systemName} onChange={this.handleNameChange}/>
              </MuiThemeProvider>

              <h5> How do you feel right now? </h5>
              <MuiThemeProvider muiTheme={muiTheme}>
                <SelectField
                  floatingLabelText="Pick your personality"
                  value={this.state.value}
                  onChange={this.handleChange}
                  autoWidth={true}>
                  <MenuItem value={1} primaryText="Young and exhuberant" />
                  <MenuItem value={2} primaryText="Fiesty and energetic" />
                  <MenuItem value={3} primaryText="Hopeful and finally getting my feet wet." />
                  <MenuItem value={4} primaryText="Wise and well-travelled." />
                  <MenuItem value={5} primaryText="I don't trust you, giant computer." />
                </SelectField>
              </MuiThemeProvider>

              <h5> What is your favorite animal? </h5>
              <MuiThemeProvider muiTheme={muiTheme}>
                <SelectField
                  floatingLabelText="Pick an animal"
                  value={this.state.animalValue}
                  onChange={this.handleAnimalChange}
                  autoWidth={true}>
                  <MenuItem value={1} primaryText="Dog" />
                  <MenuItem value={2} primaryText="Tiger" />
                  <MenuItem value={3} primaryText="Panda" />
                  <MenuItem value={4} primaryText="Owl" />
                  <MenuItem value={5} primaryText="Giraffe" />
                  <MenuItem value={6} primaryText="Narwhal" />
                </SelectField>
              </MuiThemeProvider>
              <div className='generate-system-button' onClick={this.onGenerateNewSystem.bind(this)}>Create!</div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
