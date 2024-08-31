import { useEffect, useState } from "react"
import { useUiContext } from "../providers/ui/uiProvider";
import { clamp } from "three/src/math/MathUtils.js";

export const usePointerMove = () => {
    const [pointerMove, setPointerMove] = useState({ theta: 0, phi: 0 });

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

    useEffect(() => {
        document.addEventListener('mousemove', onMouseMove);

        return () => document.removeEventListener('mousemove', onMouseMove);
    }, [startScreenOpen]);

    return pointerMove;
}