import React from 'react'
import { useUiContext } from '../../providers/ui/uiProvider.jsx';

const StartScreen = () => {

    const {startScreenOpen} = useUiContext();

    const handleClick = () => {
        document.getElementById('root').requestPointerLock();
    }

    if(!startScreenOpen)
         return null;

    return (
        <div
            className='fixed inset-0 w-full h-full z-50 flex items-center justify-center backdrop-blur-sm'
        >
            <button
                className='text-white font-bold text-5xl cursor-pointer'
                onClick={() => handleClick()}
            >Start</button>
        </div>
    )
}

export default StartScreen
