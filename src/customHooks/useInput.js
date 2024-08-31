import { useEffect, useState } from "react"

export const useInput = () => {

    const [keyMap, setKeyMap] = useState({});
    const KEYS = new Set(['KeyW','KeyS','KeyA','KeyD','ShiftLeft', 'Space']);
    

    const onKeyDown = (event) => {
        if(document.pointerLockElement && KEYS.has(event.code)) setKeyMap(prev => ({...prev, [event.code]:true}));
    }
    const onKeyUp = (event) => {
        if( document.pointerLockElement && KEYS.has(event.code)) setKeyMap(prev => ({...prev, [event.code]:false}));
    }


    useEffect(() => {
        
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
        }
    }, []);

    return keyMap;
}
