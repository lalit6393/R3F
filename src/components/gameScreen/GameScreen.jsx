import React from 'react'
import { useUiContext } from '../../providers/ui/uiProvider'
import '../../assets/styles.css';
import { UiProdiderActions } from '../../providers/ui/uiProviderTypes';
import { useUiDispatchContext } from '../../providers/ui/uiDispatchProvider';
import { JoyStick } from './components/mobileJoystick/JoyStick';

const GameScreen = () => {

    const { startScreenOpen, isTouchDevice } = useUiContext();
    const uiDispatch = useUiDispatchContext();

    const handleClick = () => {
        uiDispatch({ type: UiProdiderActions.TOGGLE_START_SCREEN, payload: true });
    }

    if (startScreenOpen)
        return null;

    return (
        <>
            <div
                className='fixed w-full h-full flex items-center justify-center z-10'
                id='gameScreen'
            >
                <p
                    className='text-white relative left-6'
                >o</p>
            </div>
            {
                isTouchDevice &&
                <>
                    <JoyStick />
                    <button
                        className='z-20'
                        id="cancel-button"
                        onClick={() => handleClick()}
                    >X</button>
                </>
            }
        </>
    )
}

export default GameScreen
