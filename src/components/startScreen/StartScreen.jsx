import React from 'react'
import { useUiContext } from '../../providers/ui/uiProvider.jsx';
import { useUiDispatchContext } from '../../providers/ui/uiDispatchProvider.jsx';
import { UiProdiderActions } from '../../providers/ui/uiProviderTypes.js';

const StartScreen = () => {

    const {startScreenOpen} = useUiContext();
    const uiDispatch = useUiDispatchContext();

    const handleClick = () => {
        document.getElementById('root').requestPointerLock();
        uiDispatch({ type: UiProdiderActions.TOGGLE_START_SCREEN, payload: false });
    }

    if(!startScreenOpen)
         return null;

    return (
        <div
            className='fixed inset-0 w-full h-full z-50 flex items-center justify-center backdrop-blur-sm'
        >
            <button
                className='font-bold text-5xl text-red cursor-pointer'
                onClick={() => handleClick()}
            >Start</button>
        </div>
    )
}

export default StartScreen
