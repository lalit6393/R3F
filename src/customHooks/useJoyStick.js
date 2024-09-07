import { useEffect, useRef, useState } from "react"

export const useJoyStick = () => {

    const centerX = useRef(0);
    const centerY = useRef(0);
    const maxDistance = useRef(0);
    const touchID = useRef(null);
    const [joystickMove, setJoystickMove] = useState({ deltaX: 0, deltaY: 0 });

    const handleTouchMove = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const touchArray = event.touches;
        let touch;
        for(let i = 0; i < touchArray.length; i++){
            if(touchArray[i].identifier === touchID.current){
                touch = touchArray[i]; 
                break;
            }
        }
        let deltaX = touch.clientX - centerX.current;
        let deltaY = touch.clientY - centerY.current;
       
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (distance > maxDistance.current) {
            deltaX = (deltaX / distance) * maxDistance.current;
            deltaY = (deltaY / distance) * maxDistance.current;
        }
        setJoystickMove(prev => ({...prev, deltaX:deltaX, deltaY:deltaY}));
    }

    const handleTouchEnd = (event) => {
        event.preventDefault();
        setJoystickMove(prev => ({...prev, deltaX:0, deltaY:0}));
    }

    const handleTouchStart = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const touchArray = event.touches;
        const touch = touchArray[touchArray.length - 1];
        touchID.current = touch.identifier;
    }


    useEffect(() => {
        const joystickContainer = document.getElementById('joystick-container');
        if(!joystickContainer) return;
        joystickContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
        joystickContainer.addEventListener('touchend', handleTouchEnd, { passive: false });
        joystickContainer.addEventListener('touchstart', handleTouchStart, { passive: false });

        const rect = joystickContainer.getBoundingClientRect();
        centerX.current = (rect.left + rect.width / 2);
        centerY.current = (rect.top + rect.height / 2);
        maxDistance.current = rect.width / 2;
        return () => {
            joystickContainer.removeEventListener('touchmove', handleTouchMove);
            joystickContainer.removeEventListener('touchend', handleTouchEnd);
            joystickContainer.removeEventListener('touchstart', handleTouchStart);
        }
    }, [])

    return joystickMove
}