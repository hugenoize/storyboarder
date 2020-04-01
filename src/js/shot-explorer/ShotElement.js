import React, { useEffect, useState, useMemo } from 'react'
import { render } from 'react-three-fiber'

const ShotElement = React.memo((
    {
        setSelectedShot, 
        object,
        aspectRatio,
        scale,
        defaultWidth,
        windowWidth
}) => {
    
    const [renderImage, setRenderImage] = useState() 
    const [imageChanged, setImageChanged] = useState({})

    const updateImage = () => {
        setImageChanged({})
    }

    useEffect(() => {
        object.subscribe(updateImage)
        return () => object.unsubscribe(updateImage)
    }, [object, updateImage])

    useEffect(() => {
        setRenderImage(object.renderImage)
    }, [object.renderImage, imageChanged])

    const paddingSize = 5
    const newDefaultWidth = defaultWidth - (paddingSize * 3)
    let height = (newDefaultWidth / 3)
    const width = ((newDefaultWidth * aspectRatio)) / 3
    return <div className="shot-explorer-element" style={{ width: width, maxWidth: width }}> 
            <div className="shot-explorer-shot" style={{ width, height, maxHeight: height }}>
                <img className="shot-explorer-image" src={ renderImage } onPointerDown={() =>{ setSelectedShot(object) }}/>
            </div>
            <div className="description">{object.toString()}</div>
        </div>
})

export default ShotElement