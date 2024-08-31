import {createContext, useContext } from "react";

export const UiDispatchContext = createContext();

export function useUiDispatchContext() {
  return useContext(UiDispatchContext);
}