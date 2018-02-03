import { createStore, Store as UnduxStore } from 'undux';


type AppModel = {
    isConnected: boolean;
    currentSymbol: string | null;
}

export type AppStore = UnduxStore<AppModel>;

export const AppStore = createStore<AppModel>({
    isConnected: false,
    currentSymbol: null
});

export type AppProps = {
    store: AppStore;
}