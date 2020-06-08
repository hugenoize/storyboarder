// selected outline is more bright
const SELECTED_COLOR = [32/256.0/2, 48/256.0/2, 233/256.0/2]
const DEFAULT_COLOR = [0.0, 0.0, 0.0]

export const patchMaterial = (material, customParameters = {}) => {
  material.userData.outlineParameters = {
    thickness: 0.008,  // character's outline
    color: DEFAULT_COLOR,
    ...customParameters
  }
  
  return material
}

export const setSelected = (object, selected = false) => {
  if (!object.material && !object.isMaterial) {
    return false
  }

  let materials = object.isMaterial ? [object] : Array.isArray(object.material) ? object.material : [object.material]

  for (let material of materials) {
    if (material.userData.outlineParameters) {
      material.userData.outlineParameters.color = selected ? SELECTED_COLOR : DEFAULT_COLOR
    }
  }
}
