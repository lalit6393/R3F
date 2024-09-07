import { useEffect } from "react"
import { useUiDispatchContext } from "../providers/ui/uiDispatchProvider";
import { UiProdiderActions } from "../providers/ui/uiProviderTypes";

export const usePointerLock = () => {

    const uiDispatch = useUiDispatchContext();

    const onPointerLock = () => {
        if (!document.pointerLockElement)
            uiDispatch({ type: UiProdiderActions.TOGGLE_START_SCREEN, payload: true });
    }

    useEffect(() => {
        document.addEventListener('pointerlockchange', onPointerLock);

        return () => document.removeEventListener('pointerlockchange', onPointerLock);
    }, []);

    return null;
}