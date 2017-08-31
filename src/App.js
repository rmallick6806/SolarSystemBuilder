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

const muiTheme = getMuiTheme({
  color: 'white'
});

class App extends Component {
  constructor() {
    super();
    this.state = {};
    this.solarSystem;
  }

  componentDidMount() {
    this.solarSystem = new SolarSystem();
    const radiusMin = 190, // Min radius of the planet belt.
      radiusMax = 300, // Max radius of the planet belt.
      planetCount = 9, // Ammount of planets.
      planetMinRadius = 20, // Min of planet radius.
      planetMaxRadius = 50, // Max of planet radius.
      asteroidMinRadius = 1,
      asteroidMaxRadius = 3,
      sunSize = 140; // Radius of sun

    let starterProperties = {
      radiusMin,
      radiusMax,
      planetMinRadius,
      planetMaxRadius,
      planetCount,
      asteroidMaxRadius,
      asteroidMinRadius,
      sunSize
    };

    this.solarSystem.setProperties(starterProperties);
    this.solarSystem.init();
  }

  onCreateSystemClick() {
    this.setState({createSystem: true})
  }

  onGenerateNewSystem(properties) {
    const {animalValue, value} = this.state;

    this.setState({generateNewSystem: true});

    const radiusMin = 190, // Min radius of the planet belt.
      radiusMax = 300, // Max radius of the planet belt.
      planetMinRadius = 20, // Min of planet radius.
      planetMaxRadius = 50, // Max of planet radius.
      asteroidMinRadius = 1,
      asteroidMaxRadius = 3,
      sunSize = 20; // Radius of sun

    let planetCountDecider = {
      1: _.sample(_.range(15, 22)),
      2: _.sample(_.range(12, 17)),
      3: _.sample(_.range(8, 11)),
      4: _.sample(_.range(6, 8)),
      5: _.sample(_.range(6, 8))
    }

    let planetEnvironmentDecider = {
      1: 'MIX',
      2: 'JUNGLE',
      3: 'FOREST',
      4: 'ICE',
      5: 'DESERT',
      6: 'OCEAN'
    };
    let sunDecider = {
      1: {
        1: {
          size: _.sample(_.range(40, 60, 5)),
          color: colors.sun
        },
        2: {
          size: _.sample(_.range(40, 60, 5)),
          color: colors.sun
        },
        3: {
          size: _.sample(_.range(40, 60, 5)),
          color: colors.blue
        },
        4: {
          size: _.sample(_.range(40, 60, 5)),
          color: colors.blue
        },
        5: {
          size: _.sample(_.range(40, 60, 5)),
          color: colors.sun
        },
        6: {
          size: _.sample(_.range(40, 60, 5)),
          color: colors.blue
        }
      },
      2: {
        1: {
          size: _.sample(_.range(60, 90, 5)),
          color: colors.sun
        },
        2: {
          size: _.sample(_.range(60, 90, 5)),
          color: colors.sun
        },
        3: {
          size: _.sample(_.range(60, 90, 5)),
          color: colors.blue
        },
        4: {
          size: _.sample(_.range(60, 90, 5)),
          color: colors.blue
        },
        5: {
          size: _.sample(_.range(60, 90, 5)),
          color: colors.sun
        },
        6: {
          size: _.sample(_.range(60, 90, 5)),
          color: colors.blue
        }
      },
      3: {
        1: {
          size: _.sample(_.range(120, 160, 5)),
          color: colors.sun
        },
        2: {
          size: _.sample(_.range(120, 160, 5)),
          color: colors.sun
        },
        3: {
          size: _.sample(_.range(120, 160, 5)),
          color: colors.blue
        },
        4: {
          size: _.sample(_.range(120, 160, 5)),
          color: colors.blue
        },
        5: {
          size: _.sample(_.range(120, 160, 5)),
          color: colors.sun
        },
        6: {
          size: _.sample(_.range(120, 160, 5)),
          color: colors.blue
        }
      },
      4: {
        1: {
          size: _.sample(_.range(120, 170, 10)),
          color: colors.red
        },
        2: {
          size: _.sample(_.range(120, 170, 10)),
          color: colors.red
        },
        3: {
          size: _.sample(_.range(120, 170, 10)),
          color: colors.sun
        },
        4: {
          size: _.sample(_.range(120, 170, 10)),
          color: colors.sun
        },
        5: {
          size: _.sample(_.range(120, 170, 10)),
          color: colors.red
        },
        6: {
          size: _.sample(_.range(120, 170, 10)),
          color: colors.sun
        }
      },
      5: {
        1: {
          size: _.sample(_.range(180, 220, 5)),
          color: colors.red
        },
        2: {
          size: _.sample(_.range(180, 220, 5)),
          color: colors.red
        },
        3: {
          size: _.sample(_.range(180, 220, 5)),
          color: colors.sun
        },
        4: {
          size: _.sample(_.range(180, 220, 5)),
          color: colors.sun
        },
        5: {
          size: _.sample(_.range(180, 220, 5)),
          color: colors.red
        },
        6: {
          size: _.sample(_.range(180, 220, 5)),
          color: colors.sun
        }
      }
    };

    let planetCount = planetCountDecider[value];
    let homePlanetEnvironement = planetEnvironmentDecider[animalValue];
    let sun = sunDecider[value][animalValue];
    let planetsArr = []

    for (let i = 0; i < planetCount; i++) {
      planetsArr.push(this.solarSystem.generatePlanet(i));
    }

    console.log(sun, '!'), 10;

    let starterProperties = {
      name: 'Solar System Ray-1',
      homePlanetEnvironement,
      planetsArr,
      radiusMin,
      radiusMax,
      planetMinRadius,
      planetMaxRadius,
      planetCount,
      asteroidMaxRadius,
      asteroidMinRadius,
      sunSize: sun.size,
      sunColor: sun.color
    };

    this.solarSystem.setProperties(starterProperties);
    this.solarSystem.generateCrazyPlanet();
    this.setState({newSystem: starterProperties})
  }

  loadSystem(properties) {
    this.solarSystem.setProperties(properties);
    this.solarSystem.generateCrazyPlanet();
  }

  handleChange = (event, index, value) => this.setState({value});
  handleAnimalChange = (event, index, animalValue) => this.setState({animalValue});

  render() {
    const { createSystem, generateNewSystem } = this.state;
    const buttonClassMap = {
      'create-system-button': true,
      'hide': createSystem
    };

    const menuClassMap = {
      'create-system-menu': true,
      'show': createSystem && !generateNewSystem,
      'hide': generateNewSystem
    };

    return (
      <div className="App">
        <div className='main-container' id='mainContainer'>
          <div className='header'>Capital One Presents...
            <div> The Universe </div>
          </div>
          <button onClick={() => this.solarSystem.clearSolarSystem()}>Click to Test</button>
          <button onClick={() => this.loadSystem(this.state.newSystem)}>Load Solar System</button>
          <div className={classList(buttonClassMap)} onClick={this.onCreateSystemClick.bind(this)}>Press Here to Create Your Own System</div>
          <div className={classList(menuClassMap)}>
              <div>Create Your Own System</div>
              <h5> Name your solar system </h5>
              <MuiThemeProvider muiTheme={muiTheme}>
                <TextField hintText="Enter a name..."/>
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
