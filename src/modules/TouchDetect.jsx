import React, { useEffect } from 'react'
import { useUiDispatchContext } from '../providers/ui/uiDispatchProvider';
import { UiProdiderActions } from '../providers/ui/uiProviderTypes';

const TouchDetect = () => {

    const uiDispatch = useUiDispatchContext();

    useEffect(() => {
        let isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        uiDispatch({ type: UiProdiderActions.TOGGLE_TOUCH_DEVICE, payload: isTouch });
    }, [])

  return null
}

export default TouchDetect;
