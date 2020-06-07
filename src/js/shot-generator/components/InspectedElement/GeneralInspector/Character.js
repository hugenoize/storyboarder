import { ipcRenderer } from 'electron'
import React, {useCallback, useMemo} from 'react'
import {Math as _Math} from 'three'
import {formatters, NumberSlider, transforms, textFormatters, textConstraints} from '../../NumberSlider'
import ColorSelect from '../../ColorSelect'
import {initialState} from '../../../../shared/reducers/shot-generator'
import CharacterPresetEditor from '../CharacterPresetEditor'
import BoneInspector from '../BoneInspector'
import ModelLoader from '../../../../services/model-loader'
const MORPH_TARGET_LABELS = {
  'mesomorphic': 'Muscular',
  'ectomorphic': 'Skinny',
  'endomorphic': 'Obese',
}

// limitation extends 10 times for Sci-fi, magic movies
const CHARACTER_HEIGHT_RANGE = {
  character: { min: 0.14732, max: 21.336 },
  child: { min: 0.1003, max: 13.84 },
  baby: { min: 0.0492, max: 9.4 }
}

// added an option to use Metric units
const prefsModule = require('electron').remote.require('./prefs')
const enableMetric = prefsModule.getPrefs()['enableMetric']

const feetAndInchesAsString = (feet, inches) => `${feet}′${inches}″`

const metersAsFeetAndInches = meters => {
  let heightInInches = meters * 39.3701
  let heightFeet = Math.floor(heightInInches / 12)
  let heightInches = Math.floor(heightInInches % 12)
  return [heightFeet, heightInches]
}

const CharacterInspector = React.memo(({updateObject, sceneObject, selectedBone, updateCharacterSkeleton}) => {
  const {id, ...props} = sceneObject

  const setX = useCallback((x) => updateObject(id, {x}), [])
  const setY = useCallback((y) => updateObject(id, {y}), [])
  const setZ = useCallback((z) => updateObject(id, {z}), [])

  const setRotation = useCallback((x) => updateObject(id, {rotation: _Math.degToRad(x)}), [])
  const setHeight = useCallback((height) => updateObject(id, {height}), [])
  const setHeadScale = useCallback((value) => updateObject(id, {headScale: (value / 100)}), [])

  const setTintColor = useCallback((tintColor) => updateObject(id, {tintColor}), [])

  const validTargets = initialState.models[props.model] && initialState.models[props.model].validMorphTargets
  const validTargetsExist = (validTargets && Object.values(validTargets).length !== 0)

  const heightRange =
  sceneObject.type == 'character' && !ModelLoader.isCustomModel(sceneObject.model)
    ? ['adult', 'teen'].some(el => sceneObject.model.includes(el))
      ? CHARACTER_HEIGHT_RANGE['character']
      : CHARACTER_HEIGHT_RANGE[sceneObject.model]
    : undefined

  const morphTargets = useMemo(() => {
    if (!validTargetsExist) {
      return null
    }
    
    const objectTargets = Object.entries(props.morphTargets)
      .filter(m => validTargets.includes(m[0]))
    
    return objectTargets.map(([key, value]) => {
      return (
        <NumberSlider
          label={MORPH_TARGET_LABELS[key]}
          value={value * 100}
          min={0} max={100} step={1}
          onSetValue={(value) => updateObject(id, { morphTargets: { [key]: value / 100 } })}
          formatter={formatters.percent}
          key={key}
        />
      )
    })
    
  }, [props.morphTargets, props.model])

  return (
    <React.Fragment>
      <div>
        <CharacterPresetEditor/>
        
        <NumberSlider label="X" value={props.x} min={-30} max={30} onSetValue={setX} textFormatter={ textFormatters.imperialToMetric }/>
        <NumberSlider label="Y" value={props.y} min={-30} max={30} onSetValue={setY} textFormatter={ textFormatters.imperialToMetric }/>
        <NumberSlider label="Z" value={props.z} min={-30} max={30} onSetValue={setZ} textFormatter={ textFormatters.imperialToMetric }/>
  
        <NumberSlider
          label="Rotation"
          value={_Math.radToDeg(props.rotation)}
          min={-180}
          max={180}
          step={1}
          onSetValue={setRotation}
          transform={transforms.degrees}
          formatter={formatters.degrees}
        />
        {ModelLoader.isCustomModel(sceneObject.model)
          ?
		  ( <NumberSlider 
				label="scale"
				min={ 0.3 }
				max={ 3.05 }
				step={ enableMetric ? 0.01 : 0.0254 }
				value={ sceneObject.height } 
				onSetValue={ setHeight }
				textConstraint={ textConstraints.sizeConstraint }
            />
		  )			  
          :
		  // Character's height
		  ( enableMetric
		    ?
			  <NumberSlider 
				label="Height" 
				value={props.height} 
				min={ heightRange.min } 
				max={ heightRange.max } 
				step={ 0.01 }
				onSetValue={setHeight}
			  />
		    :
			  <NumberSlider 
				label="Height" 
				value={props.height} 
				min={ heightRange.min } 
				max={ heightRange.max } 
				step={ 0.0254 }
				onSetValue={setHeight}
				formatter={ value => feetAndInchesAsString(
				  ...metersAsFeetAndInches(
					sceneObject.height
				  )
				) }
				textFormatter={ textFormatters.imperialToMetric }
			  />
		  )
        }
        {ModelLoader.isCustomModel(sceneObject.model) || <NumberSlider
          label="Head"
          value={props.headScale * 100}
          min={80} max={120} step={1}
          formatter={formatters.percent}
          onSetValue={setHeadScale}
        />}
  
         {ModelLoader.isCustomModel(sceneObject.model) || <ColorSelect
          label="Tint color"
          value={props.tintColor}
          onSetValue={setTintColor}
        />}

        <div className="drop_button__wrappper">
          <div className="drop_button" onClick={ () => ipcRenderer.send('shot-generator:object:drops')}>
            Drop Character to the floor
          </div>
        </div>
      </div>

      <div className="inspector-offset-row">
        {validTargetsExist && <div className="inspector-offset-row italic">Morphs</div>}
        {morphTargets}
      </div>
      { selectedBone && <BoneInspector 
        selectedBone={ selectedBone }
        sceneObject={ sceneObject } 
        updateCharacterSkeleton={ updateCharacterSkeleton }/> }
    </React.Fragment>
  )
})

export default CharacterInspector