const { useMemo, useRef, useCallback } = React = require('react')
const { useRender } = require('react-three-fiber')

const SCALE = 0.2
const POSITION = [-0.05, 0.02 + 0.1, 0.01 - 0.1]
const ROTATION = [-0.8, 0, 0]

const Help = React.memo(({ mode, getCanvasRenderer }) => {
  const ref = useRef()

  const textureRef = useRef(null)
  const getTexture = useCallback(() => {
    if (textureRef.current === null) {
      textureRef.current = new THREE.CanvasTexture(getCanvasRenderer().helpCanvas)
      // textureRef.current.flipY = false
      textureRef.current.minFilter = THREE.LinearFilter
    }
    return textureRef.current
  }, [])

  const mesh = useMemo(() => {
    return new THREE.Mesh(
      new THREE.PlaneGeometry(1, 0.775, 1),
      new THREE.MeshBasicMaterial({ map: getTexture(), transparent: true, opacity: 0.8 })
    )
  }, [mode])

  useRender((state, delta) => {
    if (getCanvasRenderer().helpNeedsRender) {
      getCanvasRenderer().renderHelp()
      getTexture().needsUpdate = true
    }
    getCanvasRenderer().helpNeedsRender = false
  })

  return mesh
    ? <primitive
      ref={ref}
      object={mesh}

      position={POSITION}
      scale={[SCALE, SCALE, SCALE]}
      rotation={ROTATION}

      onController={() => null}
      userData={{
        type: 'ui',
        id: 'help'
      }}>
    </primitive>
    : null
})

module.exports = Help