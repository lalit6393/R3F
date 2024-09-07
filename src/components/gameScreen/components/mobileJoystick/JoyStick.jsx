import { useRef, useEffect } from "react";
import '../../../../assets/styles.css';
import { useJoyStick } from "../../../../customHooks/useJoyStick";


export const JoyStick = () => {

    const joystickContainer = useRef();
    const joyStick = useRef();
    const {deltaX, deltaY} = useJoyStick();

    useEffect(() => {
        joyStick.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    }, [deltaX, deltaY])

    return (
        <div
            id="joystick-container"
            className="z-20"
            ref={joystickContainer}
        >
            <div
                ref={joyStick}
                id="joystick"
            ></div>
        </div>
    )
}