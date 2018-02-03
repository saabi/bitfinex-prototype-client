import { createStore, Store as UnduxStore } from 'undux';


type AppModel = {
    isConnected: boolean;
    isRateLimited: boolean;
    currentSymbol: string | null;
}

export type AppStore = UnduxStore<AppModel>;

export const AppStore = createStore<AppModel>({
    isConnected: false,
    isRateLimited: false,
    currentSymbol: null
});

export type AppProps = {
    store: AppStore;
}