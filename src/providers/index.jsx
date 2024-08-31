import { CombineComponents } from './combineComponents';
import UiRProvider from './ui/uiProvider';

const providers = [
  UiRProvider
]
export const AppContextProvider = CombineComponents(...providers);