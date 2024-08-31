import { useEffect, useRef, useState } from "react";
import { useInput } from "./useInput";

export const useAction = (initialAction) => {
    const [currentAction, setCurrentAction] = useState(initialAction ?? 'idle');

    const { KeyW, KeyS, KeyA, KeyD, ShiftLeft, Space } = useInput();
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
        if (Space && KeyW) setAction('runJump', 500)
        else if (Space) setAction('jump', 1000)
        else if (ShiftLeft && KeyW) setAction('run', 0)
        else if (KeyW || KeyS || KeyA || KeyD) setAction('walk', 0)
        else setAction(initialAction ?? 'idle', 0)
    }, [KeyW, KeyS, KeyA, KeyD, ShiftLeft, Space]);

    return currentAction;
}