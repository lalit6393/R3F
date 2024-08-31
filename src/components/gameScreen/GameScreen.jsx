import React from 'react'
import { useUiContext } from '../../providers/ui/uiProvider'

const GameScreen = () => {

    const {startScreenOpen} = useUiContext();

    if(startScreenOpen) 
        return null;

    return (
        <div
            className='fixed w-full h-full flex items-center justify-center z-50'
        >
           <p
           className='text-white'
           >o</p>
        </div>
    )
}

export default GameScreen
