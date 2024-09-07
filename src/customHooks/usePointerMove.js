import { useEffect, useRef, useState } from "react"
import { useUiContext } from "../providers/ui/uiProvider";
import { clamp } from "three/src/math/MathUtils.js";

export const usePointerMove = () => {
    const [pointerMove, setPointerMove] = useState({ theta: 0, phi: 0 });
    const lastX = useRef(null);
    const lastY = useRef(null);
    const touchID = useRef(null);

    const { startScreenOpen } = useUiContext();

    const onMouseMove = (event) => {
        if (!startScreenOpen) {
            setPointerMove(prev => {
                let horizontalAngle = prev.theta - event.movementX * 0.01;
                let verticalAngle = prev.phi - event.movementY * 0.008;
                verticalAngle = clamp(verticalAngle, -1.28, 1.28);
                return { ...prev, theta: horizontalAngle, phi: verticalAngle }
            });
        }
    }

    const handleTouchMove = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if(!touchID) return;
        const touchArray = event.touches;
        let touch;
        for(let i = 0; i < touchArray.length; i++){
            if(touchArray[i].identifier === touchID.current){
                touch = touchArray[i]; 
                break;
            }
        }
        const currentX = touch.clientX;
        const currentY = touch.clientY;

        if (lastX.current !== null && lastY.current !== null) {
            const movementX = currentX - lastX.current;
            const movementY = currentY - lastY.current;

            setPointerMove(prev => {
                let horizontalAngle = prev.theta - movementX * 0.01;
                let verticalAngle = prev.phi - movementY * 0.008;
                verticalAngle = clamp(verticalAngle, -1.28, 1.28);
                return { ...prev, theta: horizontalAngle, phi: verticalAngle }
            });
            // console.log(`MovementX: ${movementX}, MovementY: ${movementY}`);
        }

        // Update last touch positions
        lastX.current = currentX;
        lastY.current = currentY;

    }

    const handleTouchStart = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const touchArray = event.touches;
        const touch = touchArray[touchArray.length - 1];
        touchID.current = touch.identifier;
        lastX.current = touch.clientX;
        lastY.current = touch.clientY;
    }

    useEffect(() => {
        const gameScreen = document.getElementById('gameScreen');
        document.addEventListener('mousemove', onMouseMove);
        gameScreen.addEventListener('touchmove', handleTouchMove);
        gameScreen.addEventListener('touchstart', handleTouchStart);

        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            gameScreen.removeEventListener('touchmove', handleTouchMove);
            gameScreen.removeEventListener('touchstart', handleTouchStart);
        }
    }, [startScreenOpen]);

    return pointerMove;
}