import { act, createContext, useContext, useReducer } from "react"
import { UiProdiderActions } from "./uiProviderTypes";
import { UiDispatchContext } from "./uiDispatchProvider";

const initialState = {
  startScreenOpen: true,
  direction: { left: false, right: false, forward: false, backward: false },
  isTouchDevice: false
}

export const UiRContext = createContext(initialState);

export function useUiContext() {
  return useContext(UiRContext);
}

export default function UiRProvider({ children }) {
  const [state, dispatch] = useReducer(
    uiReducer,
    initialState
  );
  return (
    <UiRContext.Provider value={state}>
      <UiDispatchContext.Provider value={dispatch}>
        {children}
      </UiDispatchContext.Provider>
    </UiRContext.Provider>
  )
}

function uiReducer(state, action) {
  switch (action.type) {
    case UiProdiderActions.TOGGLE_START_SCREEN:
      return {
        ...state,
        startScreenOpen: action.payload,
      };
    case UiProdiderActions.TOGGLE_MOVE:
      return {
        ...state,
        direction: action.payload,
      };
    case UiProdiderActions.TOGGLE_TOUCH_DEVICE:
      return {
        ...state,
        isTouchDevice: action.payload
      }
    default:
      return state;
  }
}
