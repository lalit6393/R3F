import { createContext, useContext, useReducer } from "react"
import { UiProdiderActions } from "./uiProviderTypes";
import { UiDispatchContext } from "./uiDispatchProvider";

const initialState = {
    startScreenOpen:true
}

export const UiRContext = createContext(initialState);

export function useUiContext() {
    return useContext(UiRContext);
}

export default function UiRProvider({children}){
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
        default:
          return state;
    }
  }
  