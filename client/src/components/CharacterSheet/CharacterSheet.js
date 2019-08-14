import React, { Component } from 'react';
import axios from 'axios';
import uuidv4 from 'uuid/v4';
import { withRouter } from 'react-router-dom';
import './CharacterSheet.css';

import CharacterInfo from './CharacterSheetComponents/CharacterInfo';
import ClassLevel from './CharacterSheetComponents/ClassLevel';
import AbilityScores from './CharacterSheetComponents/AbilityScores';
import Skills from './CharacterSheetComponents/Skills';
import CombatStats from './CharacterSheetComponents/CombatStats';
import Inventory from './CharacterSheetComponents/Inventory';
import PersonalityBackground from './CharacterSheetComponents/PersonalityBackground';
import Spellcasting from './CharacterSheetComponents/Spellcasting';

import LoadMenu from './CharacterSheetComponents/LoadMenu';

const expByLevelMap = new Map([
  [1, 300],
  [2, 900],
  [3, 2700],
  [4, 6500],
  [5, 14000],
  [6, 23000],
  [7, 34000],
  [8, 48000],
  [9, 64000],
  [10, 85000],
  [11, 100000],
  [12, 120000],
  [13, 140000],
  [14, 165000],
  [15, 195000],
  [16, 225000],
  [17, 265000],
  [18, 305000],
  [19, 355000],
  [20, 0]
]);

class CharacterSheet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uuid: '',
      characterName: '',
      charClassArray: [{ class: '', level: 0 }],
      alignment: '',
      race: '',
      exp: 0,
      expAdd: '',
      str: 0,
      dex: 0,
      con: 0,
      int: 0,
      wis: 0,
      cha: 0,
      proficienciesArray: [],
      armorClass: 0,
      initiative: 0,
      speed: 0,
      hpMax: 0,
      hpCurrent: 0,
      hpTemp: 0,
      hitDice: 0,
      dsSuccesses: 0,
      dsFails: 0,
      attacksArray: [
        {
          attackName: '',
          attackBonus: 0,
          atkDmgDno: 0,
          atkDmgDice: '',
          atkDmgDnoSec: 0,
          atkDmgDiceSec: '',
          damageBonus: 0,
          damageType: '',
          attackRange: 0
        }
      ],
      spellCastingArray: [
        {
          spellCastingClass: '',
          spellCastingAbility: '',
          spellSaveDc: 0,
          spellAttackBonus: 0
        }
      ],
      spellsArray: [
        {
          level: 0,
          slots: 0,
          slotsExpended: 0,
          spellList: []
        },
        {
          level: 1,
          slots: 0,
          slotsExpended: 0,
          spellList: []
        },
        {
          level: 2,
          slots: 0,
          slotsExpended: 0,
          spellList: []
        },
        {
          level: 3,
          slots: 0,
          slotsExpended: 0,
          spellList: []
        },
        {
          level: 4,
          slots: 0,
          slotsExpended: 0,
          spellList: []
        },
        {
          level: 5,
          slots: 0,
          slotsExpended: 0,
          spellList: []
        },
        {
          level: 6,
          slots: 0,
          slotsExpended: 0,
          spellList: []
        },
        {
          level: 7,
          slots: 0,
          slotsExpended: 0,
          spellList: []
        },
        {
          level: 8,
          slots: 0,
          slotsExpended: 0,
          spellList: []
        },
        {
          level: 9,
          slots: 0,
          slotsExpended: 0,
          spellList: []
        }
      ],
      equipment: '',
      inventory: '',
      copper: 0,
      silver: 0,
      electrum: 0,
      gold: 0,
      platinum: 0,
      personality: '',
      ideals: '',
      bonds: '',
      flaws: '',
      features: '',
      background: '',
      inspiration: 0
    };
    this.initialState = this.state;

    this.handleChange = this.handleChange.bind(this);
    this.handleDeathSaves = this.handleDeathSaves.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.addClass = this.addClass.bind(this);
    this.addExperience = this.addExperience.bind(this);
    this.removeClass = this.removeClass.bind(this);
    this.handleChangeClass = this.handleChangeClass.bind(this);
    this.calculateExpToNextLevel = this.calculateExpToNextLevel.bind(this);
    this.calculateTotalLevel = this.calculateTotalLevel.bind(this);
    this.calculateProficiency = this.calculateProficiency.bind(this);
    this.calculateModifier = this.calculateModifier.bind(this);
    this.handleChangeAttack = this.handleChangeAttack.bind(this);
    this.deathSaves = this.deathSaves.bind(this);
    this.addAttack = this.addAttack.bind(this);
    this.removeAttack = this.removeAttack.bind(this);
    this.handleChangeSpells = this.handleChangeSpells.bind(this);
    this.handleChangeSpellCasting = this.handleChangeSpellCasting.bind(this);
    this.addRemoveSpellCastingClass = this.addRemoveSpellCastingClass.bind(this);
    this.handleLoad = this.handleLoad.bind(this);
    this.handleDeleteCharacter = this.handleDeleteCharacter.bind(this);
  }

  componentDidMount() {
    // checking is there is a selectedCharacter in the App state, which means a sheet is being loaded
    if (this.props.selectedCharacter === 'new') {
      return;
    } else if (this.props.selectedCharacter) {
      for (let i = 0; i < this.props.user.characterSheets.length; i++) {
        if (this.props.user.characterSheets[i].uuid === this.props.selectedCharacter) {
          const charSheet = { ...this.props.user.characterSheets[i] };
          this.setState({ ...charSheet });
        }
      }
    }
  }

  handleChange(event) {
    const target = event.target;
    const name = target.name;
    const value = target.value;
    if (target.type === 'checkbox' && target.checked) {
      const newArray = [...this.state.proficienciesArray];
      newArray.push(name);
      this.setState({
        proficienciesArray: newArray
      });
    } else if (target.type === 'checkbox' && !target.checked) {
      const newArray = [...this.state.proficienciesArray];
      const index = newArray.indexOf(name);
      newArray.splice(index, 1);
      this.setState({
        proficienciesArray: newArray
      });
    } else if (target.type === 'number' && !value) {
      this.setState({
        [name]: 0
      });
    } else {
      this.setState({
        [name]: value
      });
    }
  }

  handleSubmit(event) {
    //console.log(this.state);
    event.preventDefault();
    const charData = {
      ...this.state
    };
    delete charData.expAdd;
    //create new uuid if not already present (if character sheet has not been loaded from the database)
    if (!charData.uuid) {
      const newUuid = uuidv4();
      this.setState({
        uuid: newUuid
      });
      charData.uuid = newUuid;
    }
    //console.log(charData);
    this.props.changeRequestInProgress(true);
    axios
      .post('/characterSheet', {
        ...charData
      })
      .then(res => {
        console.log(res.data.message);
        if (res.data.error) {
          //this.props.updateError(res.data.error);
          throw new Error(res.data.error);
        }
        this.setState({});
        this.props.updateUser(res.data.user);
        this.props.changeRequestInProgress(false);
      })
      .catch(error => {
        console.log(error);
        this.props.changeRequestInProgress(false);
      });
  }

  handleLoad(event) {
    const target = event.target;
    const charUuid = target.value;
    if (charUuid === 'new') {
      this.setState({ ...this.initialState });
    } else {
      if (this.props.user) {
        for (let i = 0; i < this.props.user.characterSheets.length; i++) {
          if (this.props.user.characterSheets[i].uuid === charUuid) {
            const charSheet = { ...this.props.user.characterSheets[i] };
            this.setState({ ...charSheet });
          }
        }
      }
    }
  }

  calculateModifier(attribute, proficiency) {
    if (proficiency) {
      return this.calculateProficiency() + Math.floor(attribute / 2 - 5);
    }
    return Math.floor(attribute / 2 - 5);
  }

  handleDeathSaves(event) {
    const target = event.target;
    const dsSuccess = this.state.dsSuccesses;
    const dsFail = this.state.dsFails;
    if (target.className === 'dsSuccess') {
      if (target.checked) {
        this.setState({
          dsSuccesses: dsSuccess + 1
        });
      } else {
        this.setState({
          dsSuccesses: dsSuccess - 1
        });
      }
    }
    if (target.className === 'dsFail') {
      if (target.checked) {
        this.setState({
          dsFails: dsFail + 1
        });
      } else {
        this.setState({
          dsFails: dsFail - 1
        });
      }
    }
  }

  deathSaves(name) {
    const dsSuccess = this.state.dsSuccesses;
    const dsFail = this.state.dsFails;
    const dsNo = name.slice(-1);
    const dsName = name.slice(0, -1);
    if (dsName === 'dsSuccess') {
      return dsSuccess >= dsNo;
    }
    if (dsName === 'dsFail') {
      return dsFail >= dsNo;
    }
  }

  handleChangeAttack(event, idx) {
    const target = event.target;
    const name = target.name;
    const value = target.value;
    const newArray = [...this.state.attacksArray];
    const newAttack = newArray[idx];
    newAttack[name] = value;
    this.setState({
      attacksArray: newArray
    });
  }

  addAttack() {
    const newArray = [
      ...this.state.attacksArray,
      {
        attackName: '',
        attackBonus: 0,
        atkDmgDno: 0,
        atkDmgDice: '',
        atkDmgDnoSec: 0,
        atkDmgDiceSec: '',
        damageBonus: 0,
        damageType: '',
        attackRange: 0
      }
    ];
    this.setState({
      attacksArray: newArray
    });
  }

  removeAttack(idx) {
    const newArray = [...this.state.attacksArray];
    newArray.splice(idx, 1);
    this.setState({
      attacksArray: newArray
    });
  }

  handleChangeClass(event, idx) {
    const target = event.target;
    const name = target.name;
    const value = target.value;
    const newArray = [...this.state.charClassArray];
    const newClass = newArray[idx];
    newClass[name] = value;
    this.setState({
      charClassArray: newArray
    });
  }

  addClass() {
    const newArray = [...this.state.charClassArray, { class: '', level: 0 }];
    this.setState({
      charClassArray: newArray
    });
  }

  removeClass(idx) {
    const newArray = [...this.state.charClassArray];
    newArray.splice(idx, 1);
    this.setState({
      charClassArray: newArray
    });
  }

  calculateTotalLevel() {
    let totalLevel = 0;
    this.state.charClassArray.map(function(chClass) {
      return (totalLevel += +chClass.level);
    });
    return totalLevel;
  }

  calculateProficiency() {
    return 1 + Math.ceil(this.calculateTotalLevel() / 4);
  }

  calculateExpToNextLevel() {
    const totalLevel = this.calculateTotalLevel();
    if (expByLevelMap.has(totalLevel)) {
      return expByLevelMap.get(totalLevel);
    }
    return '';
  }

  addExperience() {
    const experience = +this.state.exp + +this.state.expAdd;
    this.setState({
      exp: experience,
      expAdd: ''
    });
  }

  handleChangeSpells(event, idx, spidx) {
    const target = event.target;
    const name = target.name;
    const value = target.value;
    const newSpellsArray = [...this.state.spellsArray];
    const spellWrapper = newSpellsArray[idx];
    const spell = spellWrapper.spellList[spidx];
    switch (name) {
      case 'spellName':
        spell['spellName'] = value;
        this.setState({
          spellsArray: newSpellsArray
        });
        break;
      case 'prepared':
        spell['isPrepared'] = target.checked;
        this.setState({
          spellsArray: newSpellsArray
        });
        break;
      case 'addSpell':
        spellWrapper.spellList.push({ spellName: '', isPrepared: false });
        this.setState({
          spellsArray: newSpellsArray
        });
        break;
      case 'removeSpell':
        spellWrapper.spellList.splice(spidx, 1);
        this.setState({
          spellsArray: newSpellsArray
        });
        break;
      default:
        spellWrapper[name] = value;
        this.setState({
          spellsArray: newSpellsArray
        });
        break;
    }
  }

  handleChangeSpellCasting(event, idx) {
    const target = event.target;
    const name = target.name;
    const value = target.value;
    const newSpellCastingArray = [...this.state.spellCastingArray];
    const spellCastingObject = newSpellCastingArray[idx];
    spellCastingObject[name] = value;
    this.setState({
      spellCastingArray: newSpellCastingArray
    });
  }

  addRemoveSpellCastingClass(event, idx) {
    const target = event.target;
    const name = target.name;
    const value = target.value;
    const newSpellCastingArray = [...this.state.spellCastingArray];
    const spellCastingObject = newSpellCastingArray[idx];
    spellCastingObject[name] = value;
    if (name === 'addSpellCasting') {
      newSpellCastingArray.push({
        spellCastingClass: '',
        spellCastingAbility: '',
        spellSaveDc: 0,
        spellAttackBonus: 0
      });
      this.setState({
        spellCastingArray: newSpellCastingArray
      });
    }
    if (name === 'removeSpellCasting') {
      newSpellCastingArray.splice(idx, 1);
      this.setState({
        spellCastingArray: newSpellCastingArray
      });
    }
  }

  handleDeleteCharacter() {
    this.props.deleteCharacter(this.state.uuid);
    this.props.history.push('/profile');
    // this.setState({ ...this.initialState });
  }

  render() {
    return (
      <form className="characterSheet" onSubmit={this.handleSubmit}>
        <LoadMenu user={this.props.user} handleLoad={this.handleLoad} />

        <CharacterInfo
          handleChange={this.handleChange}
          characterName={this.state.characterName}
          race={this.state.race}
          alignment={this.state.alignment}
        />

        <div className="topWrapper">
          <div className="leftFloat">
            <ClassLevel
              handleChange={this.handleChange}
              charClassArray={this.state.charClassArray}
              handleChangeClass={this.handleChangeClass}
              addClass={this.addClass}
              removeClass={this.removeClass}
              calculateTotalLevel={this.calculateTotalLevel}
              exp={this.state.exp}
              expAdd={this.state.expAdd}
              addExperience={this.addExperience}
              calculateExpToNextLevel={this.calculateExpToNextLevel}
            />

            <AbilityScores
              handleChange={this.handleChange}
              str={this.state.str}
              dex={this.state.dex}
              con={this.state.con}
              int={this.state.int}
              wis={this.state.wis}
              cha={this.state.cha}
              calculateModifier={this.calculateModifier}
              charClassArray={this.state.charClassArray}
              calculateProficiency={this.calculateProficiency}
              inspiration={this.state.inspiration}
              proficienciesArray={this.state.proficienciesArray}
            />
          </div>

          <Skills
            handleChange={this.handleChange}
            str={this.state.str}
            dex={this.state.dex}
            con={this.state.con}
            int={this.state.int}
            wis={this.state.wis}
            cha={this.state.cha}
            calculateModifier={this.calculateModifier}
            proficienciesArray={this.state.proficienciesArray}
          />

          <CombatStats
            handleChange={this.handleChange}
            armorClass={this.state.armorClass}
            initiative={this.state.initiative}
            hpMax={this.state.hpMax}
            speed={this.state.speed}
            dsSuccesses={this.state.dsSuccesses}
            deathSaves={this.deathSaves}
            handleDeathSaves={this.handleDeathSaves}
            dsFails={this.state.dsFails}
            attacksArray={this.state.attacksArray}
            handleChangeAttack={this.handleChangeAttack}
            addAttack={this.addAttack}
            removeAttack={this.removeAttack}
            features={this.state.features}
          />
        </div>

        <div className="leftFloat">
          <Inventory
            handleChange={this.handleChange}
            equipment={this.state.equipment}
            inventory={this.state.inventory}
            copper={this.state.copper}
            silver={this.state.silver}
            electrum={this.state.electrum}
            gold={this.state.gold}
            platinum={this.state.platinum}
          />

          <div className="hitDiceWrapper wrapperSettings">
            <label>
              Hit Dice:
              <textarea name="hitDice" value={this.state.hitDice} onChange={this.handleChange} />
            </label>
          </div>
        </div>

        <PersonalityBackground
          handleChange={this.handleChange}
          personality={this.state.personality}
          ideals={this.state.ideals}
          bonds={this.state.bonds}
          flaws={this.state.flaws}
          background={this.state.background}
        />

        <Spellcasting
          spellsArray={this.state.spellsArray}
          handleChangeSpells={this.handleChangeSpells}
          spellCastingArray={this.state.spellCastingArray}
          handleChangeSpellCasting={this.handleChangeSpellCasting}
          addRemoveSpellCastingClass={this.addRemoveSpellCastingClass}
        />
        {this.state.characterName.trim() && !this.props.requestInProgress && (
          <div className="submitBtn leftFloat">
            <input className="btn btn-primary" type="submit" value="Save character" />
          </div>
        )}
        {this.state.uuid && !this.props.requestInProgress && (
          <div className="leftFloat">
            <input
              className="btn btn-danger"
              type="button"
              onClick={this.handleDeleteCharacter}
              value="Delete Character"
            />
          </div>
        )}
      </form>
    );
  }
}

export default withRouter(CharacterSheet);
