import { useEffect, useRef, useState } from "react";
import { useInput } from "./useInput";
import { useJoyStick } from "./useJoyStick";

export const useAction = (initialAction) => {
    const [currentAction, setCurrentAction] = useState(initialAction ?? 'idle');

    const { KeyW, KeyS, KeyA, KeyD, ShiftLeft, Space } = useInput();
    const {deltaX, deltaY} = useJoyStick();
    const timer = useRef();
    const nextAction = useRef();

    const setAction = (newAction, time) => {
        nextAction.current = newAction;

        if (timer.current) return;

        setCurrentAction(newAction);
        if (time) {
            timer.current = setTimeout(() => {
                setCurrentAction(nextAction.current);
                timer.current = undefined;
            }, time);
        }
    }

    useEffect(() => {
        if (Space && (KeyW || (deltaY < -40))) setAction('runJump', 500)
        else if (Space) setAction('jump', 1000)
        else if (ShiftLeft && (KeyW || (deltaY < -40))) setAction('run', 0)
        else if (KeyW || KeyS || KeyA || KeyD || deltaX > 40 || deltaX < -40 || deltaY > 40 || deltaY < -40) setAction('walk', 0)
        else setAction(initialAction ?? 'idle', 0)
    }, [KeyW, KeyS, KeyA, KeyD, ShiftLeft, Space, deltaX, deltaY]);

    return currentAction;
}